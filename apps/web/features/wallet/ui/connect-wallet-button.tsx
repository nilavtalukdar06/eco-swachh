"use client";

import { useEffect, useState } from "react";
import {
  type Connector,
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
} from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/dal/client";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import Image from "next/image";

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <Button variant="outline" disabled={!ready} onClick={onClick}>
      <Image alt="metamask_logo" src="/metamask.svg" height={16} width={16} />
      {connector.name}
    </Button>
  );
}

function DropdownWalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <DropdownMenuItem disabled={!ready} onClick={onClick}>
      <Image alt="metamask_logo" src="/metamask.svg" height={16} width={16} className="mr-2" />
      {connector.name}
    </DropdownMenuItem>
  );
}

export function ConnectWalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const trpc = useTRPC();

  const { data: walletData } = useQuery(
    trpc.wallet.getWalletAddress.queryOptions(),
  );

  const saveWallet = useMutation(
    trpc.wallet.saveWalletAddress.mutationOptions(),
  );

  useEffect(() => {
    if (isConnected && address && walletData?.walletAddress !== address) {
      saveWallet.mutate({ walletAddress: address });
    }
  }, [isConnected, address]);

  const isWrongNetwork = isConnected && chain?.id !== 11155111; // Sepolia

  if (isConnected) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-mono text-muted-foreground max-sm:hidden">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <Button variant="outline" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </div>
        {isWrongNetwork && (
          <p className="text-xs text-red-500">
            Switch MetaMask to Sepolia testnet
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="hidden sm:flex items-center gap-2">
        {connectors.map((connector) => (
          <WalletOption
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector })}
          />
        ))}
      </div>
      <div className="flex sm:hidden items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Connect Wallet</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {connectors.map((connector) => (
              <DropdownWalletOption
                key={connector.uid}
                connector={connector}
                onClick={() => connect({ connector })}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
