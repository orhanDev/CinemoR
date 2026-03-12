import React from 'react';


class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}
	render() {
		if (this.state.hasError) {
			return (
				<div style={{
					padding: '2rem',
					textAlign: 'center',
					color: '#fff',
					background: '#1A1A1A',
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<h1 style={{ marginBottom: '1rem' }}>Something went wrong</h1>
					<p style={{ marginBottom: '2rem', opacity: 0.8 }}>
						We're sorry, but something unexpected happened. Please try refreshing the page.
					</p>
					<button
						onClick={() => {
							this.setState({ hasError: false, error: null });
							window.location.reload();
						}}
						style={{
							padding: '0.75rem 1.5rem',
							background: '#FFD700',
							color: '#000',
							border: 'none',
							borderRadius: '8px',
							cursor: 'pointer',
							fontWeight: 'bold'
						}}
					>
						Refresh Page
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
