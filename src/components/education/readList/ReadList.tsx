"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { usePrivy } from "@privy-io/react-auth";
import { useReadLists } from "@/store/use-readlists";
import { ReadListSidebar } from "./ReadListSidebar";
import { ReadListContent } from "./ReadListContent";
import { CreateListModal } from "./CreateListModal";

// Custom hook for initialization
const useReadListInitialization = () => {
  const { user: privyUser, getAccessToken } = usePrivy();
  const { initialize } = useReadLists();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!privyUser?.id) return;
      try {
        setIsInitializing(true);
        const username = privyUser.twitter?.username || privyUser.farcaster?.username || privyUser.github?.username;
        if (!username) {
          setInitError("No username available");
          return;
        }
        const token = await getAccessToken();
        if (!token) {
          setInitError("No access token available");
          return;
        }
        await initialize({ privyUserId: privyUser.id, username, privyToken: token });
      } catch (err: any) {
        setInitError(err?.message || "Failed to initialize read lists");
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [privyUser?.id, initialize, getAccessToken]);

  return { isInitializing, initError };
};

// Simple state components
const AuthRequired = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h3 className="text-white text-lg mb-2">Authentication Required</h3>
      <p className="text-[#FFFFFF80]">Please login to access your read lists</p>
    </div>
  </div>
);

const Loading = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-[#FFFFFF80]">Loading...</div>
  </div>
);

const Error = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h3 className="text-red-400 text-lg mb-2">Error</h3>
      <p className="text-[#FFFFFF80]">{error}</p>
    </div>
  </div>
);

export function ReadList() {
  const { authenticated } = useAuthContext();
  const { readLists, activeReadListId, activeReadListItems, loading: storeLoading, error: storeError, createReadList, deleteReadList, setActiveReadList, deleteReadListItem, toggleReadStatus } = useReadLists();
  const { isInitializing, initError } = useReadListInitialization();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const activeList = useMemo(() => readLists.find(list => list.id === activeReadListId), [readLists, activeReadListId]);
  const isLoading = isInitializing || storeLoading;
  const error = initError || storeError;

  const handleCreateList = useCallback(async (data: { name: string; description?: string; isPublic?: boolean }) => {
    try {
      const newList = await createReadList(data);
      if (newList) {
        setActiveReadList(newList.id);
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      // Error handled by store
    }
  }, [createReadList, setActiveReadList]);

  const handleDeleteList = useCallback(async (id: number) => {
    try {
      await deleteReadList(id);
    } catch (error) {
      // Error handled by store
    }
  }, [deleteReadList]);

  const handleRemoveItem = useCallback(async (itemId: number) => {
    try {
      await deleteReadListItem(itemId);
    } catch (error) {
      // Error handled by store
    }
  }, [deleteReadListItem]);

  const handleToggleRead = useCallback(async (itemId: number, isRead: boolean) => {
    try {
      await toggleReadStatus(itemId, isRead);
    } catch (error) {
      // Error handled by store
    }
  }, [toggleReadStatus]);

  const handleSelectList = useCallback((id: number) => setActiveReadList(id), [setActiveReadList]);
  const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

  if (!authenticated) return <AuthRequired />;
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <div className="flex h-full min-h-screen">
      <div className="w-80 flex-shrink-0">
        <ReadListSidebar
          readLists={readLists}
          activeReadListId={activeReadListId}
          onSelectList={handleSelectList}
          onCreateList={handleOpenCreateModal}
          onDeleteList={handleDeleteList}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <ReadListContent
          activeList={activeList}
          items={activeReadListItems}
          itemsLoading={storeLoading}
          onRemoveItem={handleRemoveItem}
          onToggleRead={handleToggleRead}
          onCreateList={handleOpenCreateModal}
        />
      </div>
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateList}
        isLoading={storeLoading}
        error={storeError}
      />
    </div>
  );
} 