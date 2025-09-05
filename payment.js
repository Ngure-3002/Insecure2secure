class PaymentHandler {
    static async submitPayment(paymentData) {
        try {
            const response = await fetch('http://localhost:5000/api/payments/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(paymentData),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Payment submission failed');
            return await response.json();
        } catch (error) {
            console.error('Payment error:', error);
            throw error;
        }
    }

    static async getPaymentHistory() {
        try {
            const response = await fetch('http://localhost:5000/api/payments/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch payment history');
            return await response.json();
        } catch (error) {
            console.error('Payment history error:', error);
            throw error;
        }
    }
}