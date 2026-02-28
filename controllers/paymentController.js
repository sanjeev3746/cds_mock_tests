const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const PLANS = {
  monthly: { amount: 9900,  duration: 30,  label: '1 Month'  },  // ₹99
  yearly:  { amount: 49900, duration: 365, label: '1 Year'   },  // ₹499
};

const getRazorpay = () => new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc  Create Razorpay order
// @route POST /api/payment/create-order
// @access Private
exports.createOrder = async (req, res) => {
  try {
    const { plan = 'monthly' } = req.body;
    const selected = PLANS[plan];
    if (!selected) return res.status(400).json({ status: 'error', message: 'Invalid plan' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount:   selected.amount,   // in paise
      currency: 'INR',
      receipt:  `receipt_${req.user._id}_${Date.now()}`,
      notes: { userId: req.user._id.toString(), plan },
    });

    res.json({
      status: 'success',
      data: {
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
        keyId:    process.env.RAZORPAY_KEY_ID,
        plan,
        planLabel: selected.label,
        userName:  req.user.name,
        userEmail: req.user.email,
      },
    });
  } catch (err) {
    console.error('Create Order Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to create payment order' });
  }
};

// @desc  Verify payment and activate premium
// @route POST /api/payment/verify
// @access Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = 'monthly' } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ status: 'error', message: 'Payment verification failed' });
    }

    const selected = PLANS[plan] || PLANS.monthly;
    const expiresAt = new Date(Date.now() + selected.duration * 24 * 60 * 60 * 1000);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isPremium: true, premiumExpiresAt: expiresAt },
      { new: true }
    );

    res.json({
      status: 'success',
      message: `Premium activated for ${selected.label}!`,
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
          premiumExpiresAt: user.premiumExpiresAt,
        },
      },
    });
  } catch (err) {
    console.error('Verify Payment Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to verify payment' });
  }
};
