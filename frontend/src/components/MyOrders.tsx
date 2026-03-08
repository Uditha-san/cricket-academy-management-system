import { useState, useEffect } from 'react';
import { Package, Clock, Check, X, ChevronDown, ChevronUp, ShoppingBag, MapPin, Phone } from 'lucide-react';
import api from '../api/axios';

interface OrderItem { id: string; productName: string; productImage: string; quantity: number; unitPrice: number; }
interface Order {
    id: string;
    deliveryName: string;
    deliveryPhone: string;
    deliveryAddress: string;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'cancelled';
    items: OrderItem[];
    createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};
const STATUS_ICON: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3.5 h-3.5 inline mr-1" />,
    confirmed: <Check className="w-3.5 h-3.5 inline mr-1" />,
    shipped: <Package className="w-3.5 h-3.5 inline mr-1" />,
    cancelled: <X className="w-3.5 h-3.5 inline mr-1" />,
};

export default function MyOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        api.get('/orders/my')
            .then(r => setOrders(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No orders yet</p>
                <p className="text-sm mt-1 text-gray-400">Your equipment orders will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Header row */}
                    <button
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm">
                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                    <span className="text-gray-400 font-normal ml-2 text-xs">#{order.id.slice(0, 8)}</span>
                                </p>
                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                {STATUS_ICON[order.status]}
                                {order.status}
                            </span>
                            <span className="text-sm font-bold text-green-600">Rs.{Number(order.totalAmount).toLocaleString()}</span>
                            {expanded === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                    </button>

                    {/* Expanded detail */}
                    {expanded === order.id && (
                        <div className="border-t bg-gray-50 p-4 space-y-4">
                            {/* Delivery info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-start gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">{order.deliveryName}</p>
                                        <p>{order.deliveryAddress}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4 text-green-600 shrink-0" />
                                    {order.deliveryPhone}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-2">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                                        <img
                                            src={item.productImage || '/assets/bat.webp'}
                                            alt={item.productName}
                                            className="w-10 h-10 rounded-lg object-cover"
                                            onError={e => { e.currentTarget.src = '/assets/bat.webp'; }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} × Rs.{Number(item.unitPrice).toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 shrink-0">Rs.{(item.quantity * Number(item.unitPrice)).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end text-sm font-bold text-gray-900 border-t pt-3">
                                <span className="text-gray-500 font-normal mr-2">Total</span>
                                <span className="text-green-600">Rs.{Number(order.totalAmount).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
