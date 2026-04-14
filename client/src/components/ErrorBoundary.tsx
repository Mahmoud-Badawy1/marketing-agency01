import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">عذراً، حدث خطأ غير متوقع.</h1>
          <p className="text-gray-600 mb-6 max-w-md text-center" dir="ltr">
            {this.state.error?.message}
          </p>
          <Button onClick={() => window.location.reload()}>إعادة تحميل الصفحة</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
