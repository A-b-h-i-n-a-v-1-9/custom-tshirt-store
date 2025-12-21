// Assuming you're using React for your admin dashboard
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    if (!stats) return <div>Loading...</div>;

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <div>Total Users: {stats.totalUsers}</div>
            <div>Total Orders: {stats.totalOrders}</div>
            <div>Total Sales: {stats.totalSales}</div>
            <div>Total Products: {stats.totalProducts}</div>
            <div>Total Cart Items: {stats.totalCartItems}</div>
            <div>Total Inventory: {stats.totalInventory}</div>
            <div>Total Bottles: {stats.totalBottles}</div>
            <div>Total Mugs: {stats.totalMugs}</div>
            <div>Total Custom Designs: {stats.totalCustomDesigns}</div>
        </div>
    );
};

export default AdminDashboard;
