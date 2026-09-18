import { useToast } from "../context/ToastContext";

export default function Toast() {
  const { toast } = useToast();

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className="fixed bottom-6 left-1/2 z-[2000] animate-toast-in rounded-full bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  );
}