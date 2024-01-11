import bs58 from 'bs58';
import fetch from 'cross-fetch';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { Wallet } from '@project-serum/anchor';

import { LogProvider } from '@core/providers/LogProvider';
import { SwapRequest } from '@solt/types/TokenTrade';
import { RPC_ENDPOINT } from '@config/RPC';
import { JUP_REQUEST_HEADERS, JUP_REQUEST_METHOD, BUFF_ENCODING, JUP_BASE_API } from '@config/Jupiter';


export class TokenSwapProvider {
  private conn: Connection;
  private wallet: Wallet;

  constructor(private rpcEndpoint: string = RPC_ENDPOINT, private zLog: LogProvider = new LogProvider(TokenSwapProvider.name)) {
    this.conn = new Connection(this.rpcEndpoint);
    // this.wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));
  }

  async swap(opts: { inputMint: string, outputMint: string, amount: number, slippageBps: number }): Promise<boolean> {
    const { blockhash, lastValidBlockHeight } = await this.conn.getLatestBlockhash();

    const quoteReq = RequestGenerator.quoteRequest(opts);
    const quoteResp = await fetch(quoteReq);
    const quoteResponseJson = await quoteResp.json();
    
    const { url, request } = RequestGenerator.swapRequest({ 
      quoteResponse: quoteResponseJson,
      userPublicKey: this.wallet.publicKey.toString(),
      wrapAndUnwrapSol: true
    });

    const swapResp = await fetch(url, { method: JUP_REQUEST_METHOD, headers: JUP_REQUEST_HEADERS, body: JSON.stringify(request) });
    const { swapTransaction } = await swapResp.json();

    const swapTransactionBuf = Buffer.from(swapTransaction, BUFF_ENCODING);
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