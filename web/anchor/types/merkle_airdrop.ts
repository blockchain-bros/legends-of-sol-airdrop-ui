export type MerkleAirdrop = {
  "version": "0.1.0",
  "name": "merkle_airdrop",
  "instructions": [
    {
      "name": "claim",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Token claimer."
          ]
        },
        {
          "name": "ownerMintAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "airdropState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "airdrop_state"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "token_mint"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "root"
              }
            ]
          },
          "relations": [
            "token_mint"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The SPL token program account"
          ]
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "verificationData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "init",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "airdropState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "airdrop_state"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "token_mint"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "root"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The SPL token program account"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "isToken2022",
          "type": "bool"
        }
      ]
    },
    {
      "name": "withdrawFromVault",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Airdrop State Authority"
          ]
        },
        {
          "name": "authorityMintAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "airdropState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "airdrop_state"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "token_mint"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "root"
              }
            ]
          },
          "relations": [
            "token_mint",
            "authority"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The SPL token program account"
          ]
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "airdropState",
      "docs": [
        "State for the verifier"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "isToken2022",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "receipt",
      "docs": [
        "Receipt for claiming. This prevents multiple redemptions."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PublicKeyMismatch",
      "msg": "PublicKeyMismatch"
    },
    {
      "code": 6001,
      "name": "UninitializedAccount",
      "msg": "UninitializedAccount"
    },
    {
      "code": 6002,
      "name": "IncorrectAuthority",
      "msg": "IncorrectAuthority"
    },
    {
      "code": 6003,
      "name": "NumericalOverflow",
      "msg": "NumericalOverflow"
    },
    {
      "code": 6004,
      "name": "DerivedKeyInvalid",
      "msg": "Derived key invalid"
    },
    {
      "code": 6005,
      "name": "WrongAccountOwner",
      "msg": "Wrong account owner"
    }
  ]
};

export const IDL: MerkleAirdrop = {
  "version": "0.1.0",
  "name": "merkle_airdrop",
  "instructions": [
    {
      "name": "claim",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Token claimer."
          ]
        },
        {
          "name": "ownerMintAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "airdropState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "airdrop_state"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "token_mint"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "root"
              }
            ]
          },
          "relations": [
            "token_mint"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The SPL token program account"
          ]
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "verificationData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "init",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "airdropState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "airdrop_state"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "token_mint"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "root"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The SPL token program account"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "isToken2022",
          "type": "bool"
        }
      ]
    },
    {
      "name": "withdrawFromVault",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Airdrop State Authority"
          ]
        },
        {
          "name": "authorityMintAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "airdropState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "airdrop_state"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "token_mint"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "root"
              }
            ]
          },
          "relations": [
            "token_mint",
            "authority"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The SPL token program account"
          ]
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "airdropState",
      "docs": [
        "State for the verifier"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "isToken2022",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "receipt",
      "docs": [
        "Receipt for claiming. This prevents multiple redemptions."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PublicKeyMismatch",
      "msg": "PublicKeyMismatch"
    },
    {
      "code": 6001,
      "name": "UninitializedAccount",
      "msg": "UninitializedAccount"
    },
    {
      "code": 6002,
      "name": "IncorrectAuthority",
      "msg": "IncorrectAuthority"
    },
    {
      "code": 6003,
      "name": "NumericalOverflow",
      "msg": "NumericalOverflow"
    },
    {
      "code": 6004,
      "name": "DerivedKeyInvalid",
      "msg": "Derived key invalid"
    },
    {
      "code": 6005,
      "name": "WrongAccountOwner",
      "msg": "Wrong account owner"
    }
  ]
};
