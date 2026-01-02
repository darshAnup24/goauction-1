import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Message sent successfully! We\'ll get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Have questions? We're here to help. Get in touch with our team.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Contact Info Cards */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
                        <p className="text-gray-600 mb-2">support@goauction.com</p>
                        <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
                        <p className="text-gray-600 mb-2">+1 (555) 123-4567</p>
                        <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Visit Us</h3>
                        <p className="text-gray-600 mb-2">123 Auction Street</p>
                        <p className="text-sm text-gray-500">New York, NY 10001</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MessageSquare className="w-8 h-8 text-blue-600" />
                            Send Us a Message
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="How can we help?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tell us more about your inquiry..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* FAQ Section */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    How do I create an auction?
                                </h3>
                                <p className="text-gray-600">
                                    Sign up for an account, navigate to your dashboard, and click "Create Listing". 
                                    Fill in the details, upload images, set your starting price and duration, and publish!
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Is my payment information secure?
                                </h3>
                                <p className="text-gray-600">
                                    Absolutely! We use Stripe for payment processing, which is PCI-DSS compliant and 
                                    used by millions of businesses worldwide. We never store your card details.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    What happens if I win an auction?
                                </h3>
                                <p className="text-gray-600">
                                    You'll receive an email with payment instructions and a direct link to complete your purchase. 
                                    Once paid, the seller will be notified to ship your item.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    How long does it take to get a response?
                                </h3>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    We typically respond to all inquiries within 24 hours during business days. 
                                    For urgent matters, please call our support line.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Can I cancel my bid?
                                </h3>
                                <p className="text-gray-600">
                                    Bids are binding commitments. However, in exceptional circumstances, please contact 
                                    support immediately and we'll review your case.
                                </p>
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-blue-600" />
                                Business Hours
                            </h3>
                            <div className="space-y-2 text-gray-700">
                                <div className="flex justify-between">
                                    <span>Monday - Friday:</span>
                                    <span className="font-semibold">9:00 AM - 6:00 PM EST</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Saturday:</span>
                                    <span className="font-semibold">10:00 AM - 4:00 PM EST</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sunday:</span>
                                    <span className="font-semibold">Closed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
