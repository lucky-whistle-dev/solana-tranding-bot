import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';

import { SwapRequest } from '@solt/types/TokenTrade';
import { RPC_ENDPOINT } from '@config/RPCEndpoint';
import { LogProvider } from '@core/providers/LogProvider';


const JUP_BASE_API = 'https://quote-api.jup.ag/v6';
const METHOD = 'POST';
const HEADERS = { 'Content-Type': 'application/json' };

export class TokenSwaprovider {
  private conn: Connection;
  private wallet: Wallet;

  constructor(private rpcEndpoint: string = RPC_ENDPOINT, private zLog: LogProvider = new LogProvider(TokenSwaprovider.name)) {
    this.conn = new Connection(this.rpcEndpoint);
    // this.wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));
  }

  async swap(opts: { inputMint: string, outputMint: string, amount: number, slippageBps: number }): Promise<boolean> {
    const quoteResponse = await(await fetch(RequestGenerator.quoteRequest(opts))).json();
    
    const { url, request } = RequestGenerator.swapRequest({ quoteResponse, userPublicKey: this.wallet.publicKey.toString(), wrapAndUnwrapSol: true });
    const swapResponse = await fetch(url, { method: METHOD, headers: HEADERS, body: JSON.stringify(request) });

    const { swapTransaction } = await swapResponse.json();

    const { blockhash, lastValidBlockHeight }= await this.conn.getLatestBlockhash();

    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    const vTransaction = VersionedTransaction.deserialize(swapTransactionBuf);

    vTransaction.sign([ this.wallet.payer ]);
    const rawTransaction = vTransaction.serialize();

    const signature = await this.conn.sendRawTransaction(rawTransaction, { skipPreflight: true, maxRetries: 2 });
    await this.conn.confirmTransaction({ signature,  blockhash, lastValidBlockHeight });
    
    this.zLog.debug(`https://solscan.io/tx/${signature}`);
    return true;
  }
}


class RequestGenerator {
  static quoteRequest = (opts: { inputMint: string, outputMint: string, amount: number, slippageBps: number }): string => {
    const url = [ JUP_BASE_API, 'quote' ].join('/');
    const params = [ `inputMint=${opts.inputMint}`, `outputMint=${opts.outputMint}`, `amount=${opts.amount}`, `slippageBps=${opts.slippageBps}` ].join('&')
    return [ url, params ].join('?');
  }

  static swapRequest = (opts: { quoteResponse: any, userPublicKey: string, wrapAndUnwrapSol: boolean }): { url: string, request: SwapRequest } => {
    const request: SwapRequest = { quoteResponse: opts.quoteResponse, userPublicKey: opts.userPublicKey, wrapAndUnwrapSol: opts.wrapAndUnwrapSol }

    return { url: [ JUP_BASE_API, 'swap' ].join('/'), request };
  }
}