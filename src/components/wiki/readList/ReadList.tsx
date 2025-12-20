"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { usePrivy } from "@privy-io/react-auth";
import { useReadLists } from "@/store/use-readlists";
import { ReadListSidebar } from "./ReadListSidebar";
import { ReadListContent } from "./ReadListContent";
import { CreateListModal } from "./CreateListModal";
import { readListMessages, handleReadListApiError } from "@/lib/toast-messages";
import { showXpGainToast } from "@/components/xp";

// Custom hook for initialization
const useReadListInitialization = () => {
  const { user: privyUser, getAccessToken } = usePrivy();
  const { initialize } = useReadLists();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!privyUser?.id || !isMounted) {
        return;
      }

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
      } catch {
        setInitError("Failed to initialize read lists");
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [privyUser?.id, privyUser?.twitter?.username, privyUser?.farcaster?.username, privyUser?.github?.username, initialize, getAccessToken, isMounted]);

  return { isInitializing, initError, isMounted };
};

// Simple state components
const AuthRequired = ({ onLogin }: { onLogin: () => void }) => (
  <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
    <div className="bg-brand-secondary/90 backdrop-blur-md border border-border-hover rounded-2xl shadow-xl shadow-black/20 p-8 max-w-md w-full mx-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-text-secondary text-sm">You need to login to access your read lists</p>
      </div>
      <button
        onClick={onLogin}
        className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold py-2.5 rounded-lg transition-colors"
      >
        Login
      </button>
    </div>
  </div>
);

const Error = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-rose-400 text-lg font-semibold mb-2">Error</h3>
      <p className="text-text-secondary max-w-md">{error}</p>
    </div>
  </div>
);

export function ReadList() {
  const { authenticated, login } = useAuthContext();
  const { readLists, activeReadListId, activeReadListItems, loading: storeLoading, error: storeError, createReadList, deleteReadList, setActiveReadList, deleteReadListItem, toggleReadStatus, reorderReadLists } = useReadLists();
  const { isInitializing, initError, isMounted } = useReadListInitialization();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const activeList = useMemo(() => readLists.find(list => list.id === activeReadListId), [readLists, activeReadListId]);
  const error = initError || storeError;

  const handleCreateList = useCallback(async (data: { name: string; description?: string; isPublic?: boolean }) => {
    try {
      const newList = await createReadList(data);
      if (newList) {
        setActiveReadList(newList.id);
        setIsCreateModalOpen(false);
        readListMessages.success.listCreated(data.name);

        // Show XP gain toast
        const xpReward = data.isPublic ? 20 : 15;
        const rewardMsg = data.isPublic ? "+20 XP Public ReadList created" : "+15 XP ReadList created";
        showXpGainToast(xpReward, rewardMsg);
      }
    } catch (error) {
      handleReadListApiError(error);
    }
  }, [createReadList, setActiveReadList]);

  const handleDeleteList = useCallback(async (id: number) => {
    try {
      await deleteReadList(id);
      readListMessages.success.listDeleted();
    } catch (error) {
      handleReadListApiError(error);
    }
  }, [deleteReadList]);

  const handleRemoveItem = useCallback(async (itemId: number) => {
    try {
      await deleteReadListItem(itemId);
      readListMessages.success.removedFromList(activeList?.name || 'Read List');
    } catch (error) {
      handleReadListApiError(error);
    }
  }, [deleteReadListItem, activeList]);

  const handleToggleRead = useCallback(async (itemId: number, isRead: boolean) => {
    try {
      const result = await toggleReadStatus(itemId, isRead);
      if (isRead) {
        readListMessages.success.itemMarkedAsRead();
        // Show XP toast if XP was granted (only on first read)
        if (result.xpGranted && result.xpGranted > 0) {
          showXpGainToast(result.xpGranted, "Resource read");
        }
      } else {
        readListMessages.success.itemMarkedAsUnread();
      }
    } catch (error) {
      handleReadListApiError(error);
    }
  }, [toggleReadStatus]);

  const handleSelectList = useCallback((id: number) => setActiveReadList(id), [setActiveReadList]);
  const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);
  const handleReorderLists = useCallback((newOrder: number[]) => {
    reorderReadLists(newOrder);
  }, [reorderReadLists]);

  if (error) return <Error error={error} />;

  return (
    <div className="flex h-full min-h-screen max-[699px]:flex-col">
      {!authenticated && <AuthRequired onLogin={login} />}

      <div className={`w-80 flex-shrink-0 max-[699px]:w-full ${!authenticated ? "blur-sm pointer-events-none" : ""}`}>
        <ReadListSidebar
          readLists={readLists}
          activeReadListId={activeReadListId}
          onSelectList={handleSelectList}
          onCreateList={handleOpenCreateModal}
          onDeleteList={handleDeleteList}
          onReorderLists={handleReorderLists}
          loading={isInitializing}
        />
      </div>
      <div className={`flex-1 overflow-auto ${!authenticated ? "blur-sm pointer-events-none" : ""}`}>
        <ReadListContent
          activeList={activeList}
          items={activeReadListItems}
          itemsLoading={storeLoading}
          onRemoveItem={handleRemoveItem}
          onToggleRead={handleToggleRead}
          onCreateList={handleOpenCreateModal}
          isMounted={isMounted}
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