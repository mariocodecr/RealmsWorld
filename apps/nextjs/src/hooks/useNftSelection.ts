//import { type Nft } from "~/server/api/types";
import type { paths } from "@reservoir0x/reservoir-sdk";
import { useCallback, useMemo, useState } from "react";

export const MAX_SELECTED_ITEMS = 30;

export default function useNftSelection({
  userAddress,
}: {
  userAddress: `0x${string}`;
}) {
  //const { sourceChain } = useCurrentChain();
  //const { address: userAddress } = useAccountFromChain(sourceChain);

  const [selectedTokensByUserAddress, setSelectedTokensByUserAddress] =
    useState<
      Record<
        `0x${string}`,
        { collectionAddress: string; tokenIds: Array<string> } | null
      >
    >();

  const { selectedCollectionAddress, selectedTokenIds } = useMemo(
    () => ({
      selectedCollectionAddress: userAddress
        ? selectedTokensByUserAddress?.[userAddress]?.collectionAddress
        : undefined,
      selectedTokenIds: userAddress
        ? selectedTokensByUserAddress?.[userAddress]?.tokenIds ?? []
        : [],
    }),
    [selectedTokensByUserAddress, userAddress],
  );

  const totalSelectedNfts = useMemo(
    () => selectedTokenIds.length,
    [selectedTokenIds],
  );

  const isNftSelected = useCallback(
    (tokenId: string, collectionAddress: string) => {
      return (
        selectedTokenIds.includes(tokenId) &&
        collectionAddress === selectedCollectionAddress
      );
    },
    [selectedCollectionAddress, selectedTokenIds],
  );

  function selectNft(tokenId: string, collectionAddress: string) {
    if (
      isNftSelected(tokenId, collectionAddress) ||
      userAddress === undefined
    ) {
      return;
    }

    if (
      totalSelectedNfts === MAX_SELECTED_ITEMS &&
      collectionAddress === selectedCollectionAddress
    ) {
      // TODO @YohanTz: Trigger toast here
      return;
    }

    if (
      collectionAddress !==
      selectedTokensByUserAddress?.[userAddress]?.collectionAddress
    ) {
      setSelectedTokensByUserAddress((previousValue) => ({
        ...previousValue,
        [userAddress]: { collectionAddress, tokenIds: [tokenId] },
      }));
      return;
    }

    setSelectedTokensByUserAddress((previousValue) => ({
      ...previousValue,
      [userAddress]: {
        collectionAddress,
        tokenIds: [...selectedTokenIds, tokenId],
      },
    }));
  }

  const deselectNft = useCallback(
    (tokenId: string, collectionAddress: string) => {
      if (
        !isNftSelected(tokenId, collectionAddress) ||
        userAddress === undefined
      ) {
        return;
      }

      if (selectedTokenIds.length === 1) {
        setSelectedTokensByUserAddress((previousValue) => ({
          ...previousValue,
          [userAddress]: undefined,
        }));
        return;
      }

      setSelectedTokensByUserAddress((previousValue) => ({
        ...previousValue,
        [userAddress]: {
          collectionAddress,
          tokenIds: selectedTokenIds.filter(
            (selectedTokenId) => selectedTokenId !== tokenId,
          ),
        },
      }));
    },
    [
      isNftSelected,
      selectedTokenIds,
      setSelectedTokensByUserAddress,
      userAddress,
    ],
  );

  function selectBatchNfts(
    nfts: NonNullable<
      paths["/users/{user}/tokens/v10"]["get"]["responses"]["200"]["schema"]["tokens"]
    >,
  ) {
    if (nfts.length === 0 || userAddress === undefined) {
      return;
    }

    setSelectedTokensByUserAddress((previousValue) => ({
      ...previousValue,
      [userAddress]: {
        collectionAddress: nfts[0]?.token?.contract,
        tokenIds: nfts
          .map((nft) => nft.token?.tokenId)
          .slice(0, MAX_SELECTED_ITEMS),
      },
    }));
  }

  const deselectAllNfts = useCallback(() => {
    if (userAddress === undefined) {
      return;
    }

    setSelectedTokensByUserAddress((previousValue) => ({
      ...previousValue,
      [userAddress]: undefined,
    }));
  }, [setSelectedTokensByUserAddress, userAddress]);

  function toggleNftSelection(tokenId: string, collectionAddress: string) {
    if (userAddress === undefined) {
      return;
    }

    if (isNftSelected(tokenId, collectionAddress)) {
      deselectNft(tokenId, collectionAddress);
      return;
    }

    selectNft(tokenId, collectionAddress);
  }

  return {
    deselectAllNfts,
    deselectNft,
    isNftSelected,
    selectBatchNfts,
    selectedCollectionAddress,
    selectedTokenIds,
    toggleNftSelection,
    totalSelectedNfts,
  };
}