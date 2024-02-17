'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppHero } from '../ui/ui-layout';
import idl from '@/anchor/idl/merkle_airdrop.json';

import airdropData from '@/anchor/airdrop-data.json';
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import { BalanceTree } from '@/components/utils/balance_tree';
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import {
  setProvider,
  AnchorProvider,
  BN,
  Idl,
  Program,
} from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  associatedAddress,
} from '@coral-xyz/anchor/dist/cjs/utils/token';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

type Account = {
  account: PublicKey;
  amount: BN;
};
const mint = 'DtaWy4eMed4zBRamME5ocgn2jBct99Ko9k9kPs7KFUge';

const toBytes32Array = (b: Buffer): number[] => {
  const buf = Buffer.alloc(32);
  b.copy(buf, 32 - b.length);

  return Array.from(buf);
};

function getAnchorEnvironment(
  idl: Idl,
  anchorWallet: AnchorWallet,
  connection: Connection,
  programId: PublicKey
) {
  const provider = new AnchorProvider(connection, anchorWallet, {});
  setProvider(provider);
  const programClient = new Program(idl, programId);
  return [provider, programClient];
}

export default function DashboardFeature() {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  const [claimAmount, setclaimAmount] = useState(0);
  const [claimIndex, setClaimIndex] = useState(0);

  const getClaimAmount = useCallback(async () => {
    if (!anchorWallet) return;

    const amountsByRecipient: Account[] = [];

    for (const line of airdropData as []) {
      const { account, amount } = line;
      amountsByRecipient.push({
        account: new PublicKey(account),
        // the amount must be multiplied by decimal points
        amount: new BN(Number(amount)),
      });
    }
    // index is the index of the account in the file

    console.log('index of claimor', claimIndex);
    const index = (amountsByRecipient as Account[]).findIndex(
      (e: Account) =>
        e.account.toString() === anchorWallet.publicKey?.toBase58()
    );
    setClaimIndex(index);
    setclaimAmount(amountsByRecipient[index].amount.toNumber());
  }, [anchorWallet, claimIndex]);

  useEffect(() => {
    if (anchorWallet?.publicKey) getClaimAmount();
  }, [anchorWallet, getClaimAmount]);

  const handleClaim = useCallback(async () => {
    if (!anchorWallet) return;
    const [provider, merkleAirdropProgram] = getAnchorEnvironment(
      idl as Idl,
      anchorWallet,
      connection,
      new PublicKey(idl.metadata.address)
    );
    const amountsByRecipient: Account[] = [];

    console.log('amount to claim', amountsByRecipient);
    // merkle root tree
    const tree = new BalanceTree(amountsByRecipient as Account[]);
    const merkleRoot = tree.getRoot();
    console.log('merkleRoot', merkleRoot);
    const tokenMint = new PublicKey(mint);

    // merkle proof
    const proofStrings: Buffer[] = tree.getProof(
      claimIndex,
      (amountsByRecipient as Account[])[claimIndex].account,
      (amountsByRecipient as Account[])[claimIndex].amount
    );
    const proofBytes: number[][] = proofStrings.map((p) => toBytes32Array(p));

    let verificationData = Buffer.allocUnsafe(8);
    verificationData.writeBigUInt64LE(BigInt(claimIndex));

    const [airdropState] = PublicKey.findProgramAddressSync(
      [Buffer.from('airdrop_state'), tokenMint.toBuffer(), merkleRoot],
      new PublicKey(idl.metadata.address)
    );
    const vault = associatedAddress({ mint: tokenMint, owner: airdropState });

    // the receipt must be here since it is only the first 8 bytes rather than the complete data
    const [receipt] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('receipt'),
        airdropState.toBuffer(),
        anchorWallet.publicKey!.toBuffer(),
        verificationData,
      ],
      new PublicKey(idl.metadata.address)
    );

    for (const proofElem of proofBytes) {
      verificationData = Buffer.concat([
        verificationData,
        Buffer.from(proofElem),
      ]);
    }
    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400_000,
    });

    const claimIxn = await (merkleAirdropProgram as Program<Idl>).methods
      .claim(
        toBytes32Array(merkleRoot),
        amountsByRecipient[claimIndex].amount,
        verificationData
      )
      .accounts({
        owner: anchorWallet.publicKey!,
        ownerMintAta: associatedAddress({
          mint: tokenMint,
          owner: anchorWallet.publicKey!,
        }),
        tokenMint,
        receipt,
        airdropState,
        vault,
        splTokenProgram: TOKEN_PROGRAM_ID,
        ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      //.signers([wallet])
      .instruction();

    const latestBlockHashClaim = await connection.getLatestBlockhash();
    const txClaim = new Transaction({
      recentBlockhash: latestBlockHashClaim.blockhash,
    });
    txClaim.add(...[computeBudgetIx, claimIxn]);
    await (provider as AnchorProvider).sendAndConfirm(txClaim);
    console.log(merkleRoot);
    console.log(verificationData);
  }, [anchorWallet, claimIndex, connection]);
  return (
    <div className='w-full'>
      <AppHero
        title="Claim your $LEGEND!"
        subtitle={"Come on tough guy, press the button"}
      />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2 ">
          <button onClick={handleClaim} className="btn btn-lg btn-primary">
            CLAIM {claimAmount} $LEGEND
          </button>
        </div>
      </div>
    </div>
  );
}
