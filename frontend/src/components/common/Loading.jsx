const Loading = ({ size = 'medium', fullScreen = false }) => {
    const sizes = {
        small: 'w-6 h-6',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    const Spinner = () => (
        <div className={`${sizes[size]} border-4 border-gray-200 border-t-green-600 rounded-full animate-spin`}></div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
                <div className="text-center">
                    <Spinner />
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            <Spinner />
        </div>
    );
};

export default Loading;
