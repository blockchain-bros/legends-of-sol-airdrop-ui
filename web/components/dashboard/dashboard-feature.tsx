'use client';

import { toast } from 'react-hot-toast';
import { useCallback, useEffect, useState } from 'react';
import { AppHero } from '../ui/ui-layout';
import idl from '@/anchor/idl/merkle_airdrop.json';

import airdropData from '@/anchor/amounts.json';
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
const mint = 'Ay7A8B1cCs9SZhdPEmmAVePBQYDSft3MmSr4Zo7tJ6T';

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
  const [claimIndex, setClaimIndex] = useState(-1);
  const [claimStatus, setClaimStatus] = useState('' as string);

  const getClaimAmount = useCallback(async () => {
    if (!anchorWallet) {
      toast.error('Connect your wallet');
      return;
    }

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

    toast('(debug) index of claimor: ' + claimIndex);
    const index = (amountsByRecipient as Account[]).findIndex(
      (e: Account) =>
        e.account.toString() === anchorWallet.publicKey?.toBase58()
    );
    const amount = amountsByRecipient[index].amount.toNumber();
    if (amount) {
      toast('Claim Amount: ' + amount / 1e9 + ' $LEGEND');
    } else {
      toast('Sorry, no claim');
    }
    setClaimIndex(index);
    setclaimAmount(amount);
  }, [anchorWallet, claimIndex]);

  const checkStatus = useCallback(async () => {
    if (!anchorWallet) return;
    try {
      const [provider, merkleAirdropProgram] = getAnchorEnvironment(
        idl as Idl,
        anchorWallet,
        connection,
        new PublicKey(idl.metadata.address)
      );

      console.log(provider);

      const amountsByRecipient: Account[] = [];

      const tree = new BalanceTree(amountsByRecipient as Account[]);
      const merkleRoot = tree.getRoot();
      console.log('merkleRoot', merkleRoot);
      const tokenMint = new PublicKey(mint);

      const verificationData = Buffer.allocUnsafe(8);
      verificationData.writeBigUInt64LE(BigInt(claimIndex));

      const [airdropState] = PublicKey.findProgramAddressSync(
        [Buffer.from('airdrop_state'), tokenMint.toBuffer(), merkleRoot],
        new PublicKey(idl.metadata.address)
      );

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
      const data = await (
        merkleAirdropProgram as Program<Idl>
      ).account.merkleAidrop.getAccountInfo(receipt);
      setClaimStatus(data?.toString() || '');
    } catch (e) {
      setClaimStatus('Unclaimed');
    }
  }, [anchorWallet, claimIndex, connection]);

  useEffect(() => {
    if (anchorWallet?.publicKey) getClaimAmount();
    if (anchorWallet?.publicKey) checkStatus();
  }, [anchorWallet, checkStatus, getClaimAmount]);

  const handleClaim = useCallback(async () => {
    if (!anchorWallet) return;
    try {
      const [provider, merkleAirdropProgram] = getAnchorEnvironment(
        idl as Idl,
        anchorWallet,
        connection,
        new PublicKey(idl.metadata.address)
      );

      const amountsByRecipient: Account[] = [];

      for (const line of airdropData as []) {
        const { account, amount } = line;
        amountsByRecipient.push({
          account: new PublicKey(account),
          // the amount must be multiplied by decimal points
          amount: new BN(Number(amount)),
        });
      }

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

      toast.success('CLAIMED');

      console.log(merkleRoot);
      console.log(verificationData);
    } catch (e) {
      toast.error('Claim failed');
    }
  }, [anchorWallet, claimIndex, connection]);
  return (
    <div className="w-full">
      <AppHero
        title="Claim your $LEGEND!"
        subtitle={'Come on tough guy, press the button'}
      />
      claim status: {claimStatus}
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2 ">
          {claimIndex > -1 && (
            <button onClick={handleClaim} className="btn btn-lg btn-primary">
              CLAIM {claimAmount / 1e9} $LEGEND
            </button>
          )}

          {claimIndex === -1 && (
            <button onClick={getClaimAmount}>Check your claim!</button>
          )}
        </div>
      </div>
    </div>
  );
}
