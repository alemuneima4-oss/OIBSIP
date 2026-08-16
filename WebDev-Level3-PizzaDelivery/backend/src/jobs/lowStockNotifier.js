const cron = require("node-cron");
const Inventory = require("../models/Inventory");
const { sendEmail } = require("../utils/mailer");

const startLowStockNotifier = (opts = {}) => {
    const schedule = process.env.LOW_STOCK_CRON || opts.schedule || "0 * * * *"; // default: hourly
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        console.warn("LOW STOCK NOTIFIER: ADMIN_EMAIL not set — notifier disabled.");
        return null;
    }

    try {
        const task = cron.schedule(schedule, async () => {
            try {
                const lowItems = await Inventory.find({ $expr: { $lt: ["$quantity", "$lowStockThreshold"] } });

                if (!lowItems || lowItems.length === 0) {
                    // nothing to do
                    return;
                }

                const lines = lowItems.map(i => `${i.name}: ${i.quantity} ${i.unit} (threshold ${i.lowStockThreshold})`);
                const text = `Low inventory items detected:\n\n${lines.join("\n")}`;

                const subject = `Low Inventory Alert — ${lowItems.length} items`;

                const result = await sendEmail({ to: adminEmail, subject, text });

                console.log(`LowStockNotifier: emailed admin (${adminEmail}).`);
                if (result?.preview) console.log("Ethereal preview:", result.preview);
            } catch (err) {
                console.error("LowStockNotifier error:", err);
            }
        }, { scheduled: true });

        console.log(`LowStockNotifier scheduled (${schedule})`);

        return task;
    } catch (err) {
        console.error("Failed to schedule LowStockNotifier:", err);
        return null;
    }
};

module.exports = { startLowStockNotifier };
