"use client";

import { Toast } from "@base-ui/react/toast";

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Toast.Provider timeout={5000}>
      {children}

      <Toast.Portal>
        <Toast.Viewport className="fixed inset-x-4 bottom-4 z-50 flex max-h-[calc(100vh-2rem)] flex-col items-end gap-2 outline-none sm:left-auto sm:right-4 sm:inset-x-auto sm:w-96">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList() {
  const toastManager = Toast.useToastManager();

  return (
    <>
      {toastManager.toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          toast={toast}
          className="w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {toast.title ? (
                <Toast.Title className="font-semibold text-slate-950">
                  {toast.title}
                </Toast.Title>
              ) : null}

              {toast.description ? (
                <Toast.Description className="mt-1 text-sm leading-5 text-slate-600">
                  {toast.description}
                </Toast.Description>
              ) : null}
            </div>

            <Toast.Close
              aria-label="Close notification"
              className="shrink-0 rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            >
              Close
            </Toast.Close>
          </div>
        </Toast.Root>
      ))}
    </>
  );
}
