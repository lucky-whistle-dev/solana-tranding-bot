import { InferType } from '@core/types/Infer'

let test = {
  "fDXIm": [
    {
      "IUraF": [
        {
          "yYC3sRKOa": [
            "UMAgRz3",
            "a",
            "p"
          ]
        },
        {
          "7pn": [
            "yq7eY0I3JD",
            "eNdvyB"
          ],
          "kX1vL9u": "qOqc3OML9z",
          "701hq1Ft": [
            "Z",
            "I3B7X",
            "zZllsE"
          ],
          "gQZews35": [
            "MpuK5B",
            "Oy3",
            "TuOxXx4qS"
          ],
          "U": "UUxo"
        },
        {
          "Y3": "XhW",
          "MeeIZtVOQ2": [
            "nIBkIHeXXi"
          ],
          "qT": [
            "bb"
          ],
          "oT87RykZIX": "m8oAhrBWOO"
        }
      ],
      "xVPmOPS": {
        "YoJcl": "bTjK8FaY53",
        "dxL7": [
          "m87MLIwZze"
        ],
        "HN9qWMKu": "2",
        "y2": [
          "PLD"
        ],
        "ErQ": [
          "we5MYk"
        ]
      }
    },
    {
      "kn8w": {
        "F": "HDhbfR",
        "VM": "DPb0Y",
        "WWhWxDIjr": "B2G"
      },
      "Av": {
        "3prglxvJ": [
          "7fwTGKwt0",
          "KVc6R"
        ],
        "W4pz4Em": "leq",
        "dykLkjuR2R": "0UGIH",
        "OOChe0": "1cgBYdT",
        "SGNepgjkw": "KCSE"
      },
      "RZsX6O5efF": {
        "0EFps": [
          "TSUo0u"
        ]
      },
      "up8XqE6Ih": [
        {
          "59p2UQ": "vX6oKspMY3",
          "aEqO7aIZ": "jeSNSFWhWU",
          "S65VsAj5z": [
            "B",
            "GTi"
          ],
          "loaQAq": "hEj"
        },
        {
          "r1D26L": "6TBnHfc",
          "F": [
            "79Eq5Q"
          ]
        },
        {
          "R": [
            "QwVO"
          ],
          "ild1ngJ": "rUfE",
          "2QVEfV": [
            "n1O1N"
          ],
          "TSwe": "HsrQ0"
        }
      ]
    },
    {
      "GDqJIm5s": {
        "Vlrw5FE2Mp": [
          "qaFr",
          "ue"
        ],
        "1Q5NwvLHDs": "r95nD3888",
        "rEZpYiVoj": "pNIXa"
      },
      "RibwmevK": [
        {
          "3xn6Uz": "N2pa",
          "yQF": "7u8OWEemLt"
        },
        {
          "U6mqf": [
            "5aby8LQ",
            "CEv",
            "BIis17"
          ]
        },
        {
          "hnkoQt": "KKLVXD1K",
          "bFdsnjWdb": "orbPlJwHci"
        }
      ]
    }
  ],
  "01vqyxtoEC": {
    "n9BW": [
      {
        "Wk3G": "v",
        "R4Npz6N0": "XR",
        "e2rjLUqd": "bthHXD2",
        "i": "Y5H5",
        "0n": [
          "OJxc0oIyIP",
          "ra2L",
          "jCrlxhKvQO"
        ]
      }
    ],
    "hLt5nc": {
      "Mt5Y7rk": "naJMD",
      "RfY1nb7": [
        "pWVUfeN2",
        "9e"
      ],
      "IXXaLhJSfG": [
        "lzpb"
      ]
    },
    "0vM24ZRzDh": [
      {
        "C": "rjKJ",
        "5ilJmB6E": [
          "NuHtqiTta",
          "0u1W20k",
          "eR65Pz9"
        ]
      }
    ],
    "1RkgpYj": {
      "6": [
        "CYiec",
        "v3"
      ],
      "tw": "FhLlFKlW5A",
      "0hjO1CA5": "KofVMfh",
      "95KmAUQ56": "P",
      "uHlgc": "deXT"
    },
    "B9cVQiV": {
      "NgOsdrTEI": "YAisyOm9S"
    }
  }
}

const hello = test

const inferred: InferType<typeof hello, { action: 'OPTIONAL', keys: keyof typeof hello}> = {
  
}