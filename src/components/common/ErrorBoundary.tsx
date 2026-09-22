import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    errorId: string | null;
}

/**
 * ErrorBoundary - Graceful crash handling for kids app
 * 
 * Catches render errors and displays user-friendly fallback UI.
 * Slovak copy, child-safe messaging.
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorId: null };
    }

    static getDerivedStateFromError(_: Error): State {
        // Generate simple error ID for reference
        const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
        return { hasError: true, errorId };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to console only (no external services for MVP)
        console.error('[ErrorBoundary] Caught error:', error);
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                        {/* Error Icon */}
                        <div className="text-6xl mb-4">😵</div>
                        
                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-800 mb-3">
                            Ups! Niečo sa pokazilo.
                        </h1>
                        
                        {/* Description */}
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Skús obnoviť aplikáciu. Ak problém pretrvá, 
                            vymaž dáta v nastaveniach.
                        </p>
                        
                        {/* Reload Button */}
                        <button
                            onClick={this.handleReload}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 
                                       text-white font-bold py-4 px-6 rounded-xl
                                       shadow-lg hover:shadow-xl transition-all
                                       active:scale-95"
                        >
                            🔄 Obnoviť aplikáciu
                        </button>
                        
                        {/* Error ID for reference */}
                        {this.state.errorId && (
                            <p className="mt-4 text-xs text-gray-400">
                                Kód chyby: {this.state.errorId}
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
