import { LoadingState } from "@/components/common/LoadingState";

interface AuthLoadingStateProps {
  message?: string;
}

export function AuthLoadingState({ message = "Authenticating..." }: AuthLoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingState message={message} />
    </div>
  );
}