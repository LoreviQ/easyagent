// Palceholder dahsboard

export default function Dashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Message Frequency Chart */}
                <div className="bg-theme-bg-card p-4 rounded-lg border border-theme-bg-border">
                    <h2 className="text-lg font-semibold mb-4">Message Frequency</h2>
                    <div className="h-48 flex items-center justify-center bg-theme-bg-secondary rounded">
                        {/* Placeholder for actual chart */}
                        <p className="text-theme-primary">Message frequency visualization</p>
                    </div>
                </div>

                {/* Recent Messages */}
                <div className="bg-theme-bg-card p-4 rounded-lg border border-theme-bg-border">
                    <h2 className="text-lg font-semibold mb-4">Recent Messages</h2>
                    <div className="space-y-4">
                        {/* Sample recent messages */}
                        <div className="border-b border-theme-bg-border pb-2">
                            <p className="font-medium">Hello team!</p>
                            <p className="text-sm text-theme-secondary">Sent 2 hours ago</p>
                        </div>
                        <div className="border-b border-theme-bg-border pb-2">
                            <p className="font-medium">Project update</p>
                            <p className="text-sm text-theme-secondary">Sent 5 hours ago</p>
                        </div>
                        <div className="border-b border-theme-bg-border pb-2">
                            <p className="font-medium">Weekly report</p>
                            <p className="text-sm text-theme-secondary">Sent yesterday</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
