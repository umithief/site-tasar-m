import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 bg-black text-white h-screen overflow-auto">
                    <h1 className="text-2xl text-red-500 font-bold mb-4">Bir şeyler ters gitti.</h1>
                    <h2 className="text-xl font-bold mb-2">Hata Detayı:</h2>
                    <pre className="bg-gray-900 p-4 rounded text-sm text-red-300 whitespace-pre-wrap mb-6">
                        {this.state.error?.toString()}
                    </pre>
                    <h3 className="text-lg font-bold mb-2">Component Stack:</h3>
                    <pre className="bg-gray-900 p-4 rounded text-xs text-gray-400 whitespace-pre-wrap">
                        {this.state.errorInfo?.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Sayfayı Yenile
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
