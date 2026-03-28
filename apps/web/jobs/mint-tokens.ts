import { inngest } from "./client";
import { ethers } from "ethers";
import { prisma } from "@workspace/db";

const ERC20_MINT_ABI = ["function mint(address to, uint256 amount) external"];

export const mintEcoTokens: any = inngest.createFunction(
  {
    id: "mint-eco-tokens",
    retries: 3,
    triggers: [{ event: "token/mint" }],
  },
  async ({ event, step }) => {
    const { userId, amount } = event.data as {
      userId: string;
      amount: number;
    };

    const user = await step.run("get-user-wallet", async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        select: { walletAddress: true },
      });
    });

    if (!user?.walletAddress) {
      return { skipped: true, reason: "User has not connected a wallet" };
    }

    const txHash = await step.run("mint-on-chain", async () => {
      const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
      const signer = new ethers.Wallet(
        process.env.MINTER_PRIVATE_KEY!,
        provider,
      );
      const contract = new ethers.Contract(
        process.env.ECO_TOKEN_CONTRACT!,
        ERC20_MINT_ABI,
        signer,
      ) as any;

      const tx = await contract.mint(user.walletAddress, amount);
      const receipt = await tx.wait();
      return receipt.hash;
    });

    return { success: true, txHash, amount, userId };
  },
);
