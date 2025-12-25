import { ForumClient } from '@foru-ms/sdk';
import express from 'express';

/**
 * Example: Webhooks
 * Demonstrates setting up, handling, and verifying webhooks
 */

async function setupWebhooks() {
    const client = new ForumClient({
        apiKey: process.env.FORU_API_KEY || 'your_api_key',
    });

    // Example 1: Create a Webhook
    console.log('=== Creating a Webhook ===');
    const webhook = await client.webhooks.create({
        name: 'Thread Activity Monitor',
        url: 'https://your-domain.com/webhooks/foru',
        events: [
            'thread.created',
            'thread.updated',
            'thread.deleted',
            'post.created',
        ],
    });
    console.log('Webhook created:', webhook.webhook.id);
    console.log('Secret:', webhook.webhook.secret); // Save this securely!

    // Example 2: List All Webhooks
    console.log('\n=== Listing Webhooks ===');
    const webhooks = await client.webhooks.list();
    console.log('Total webhooks:', webhooks.webhooks.length);

    // Example 3: Update a Webhook
    console.log('\n=== Updating a Webhook ===');
    await client.webhooks.update(webhook.webhook.id, {
        active: true,
        events: [
            'thread.created',
            'thread.updated',
            'thread.deleted',
            'post.created',
            'post.updated', // Added new event
        ],
    });
    console.log('Webhook updated');

    // Example 4: Get Webhook Deliveries
    console.log('\n=== Getting Webhook Deliveries ===');
    const deliveries = await client.webhooks.getDeliveries(webhook.webhook.id);
    console.log('Total deliveries:', deliveries.total);
    console.log('Recent deliveries:', deliveries.deliveries.slice(0, 5));

    return webhook.webhook.secret;
}

/**
 * Example webhook handler using Express
 */
function setupWebhookHandler(secret: string) {
    const app = express();
    const client = new ForumClient({
        apiKey: process.env.FORU_API_KEY || 'your_api_key',
    });

    // Important: Use raw body for signature verification
    app.use(express.json({
        verify: (req: any, res, buf) => {
            req.rawBody = buf.toString();
        }
    }));

    app.post('/webhooks/foru', (req: any, res) => {
        // Example 5: Verify Webhook Signature with Timestamp
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        const event = req.headers['x-webhook-event'];

        // Verify timestamp age (prevent replay attacks)
        const age = Date.now() - parseInt(timestamp);
        if (age > 5 * 60 * 1000) { // 5 minutes
            console.error('Webhook timestamp too old');
            return res.status(400).send('Webhook timestamp too old');
        }

        // Verify signature
        const isValid = client.webhooks.verifySignature(
            req.body,
            signature,
            timestamp,
            secret
        );

        if (!isValid) {
            console.error('Invalid webhook signature');
            return res.status(401).send('Invalid signature');
        }

        // Process webhook payload
        console.log('Received webhook event:', event);
        const payload = req.body;

        switch (event) {
            case 'thread.created':
                handleThreadCreated(payload);
                break;
            case 'thread.updated':
                handleThreadUpdated(payload);
                break;
            case 'thread.deleted':
                handleThreadDeleted(payload);
                break;
            case 'post.created':
                handlePostCreated(payload);
                break;
            default:
                console.log('Unhandled event type:', event);
        }

        // Always respond quickly to acknowledge receipt
        res.status(200).send('OK');
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`\nWebhook handler listening on port ${PORT}`);
        console.log(`Endpoint: http://localhost:${PORT}/webhooks/foru`);
    });
}

// Event handler functions
function handleThreadCreated(thread: any) {
    console.log('New thread created:', thread.id);
    console.log('Title:', thread.title);
    console.log('Author:', thread.userId);

    // Example: Send notification, update database, etc.
}

function handleThreadUpdated(thread: any) {
    console.log('Thread updated:', thread.id);
    console.log('Title:', thread.title);
}

function handleThreadDeleted(thread: any) {
    console.log('Thread deleted:', thread.id);
}

function handlePostCreated(post: any) {
    console.log('New post created:', post.id);
    console.log('Thread:', post.threadId);
    console.log('Author:', post.userId);

    // Example: Check for spam, auto-moderate, etc.
}

// Main execution
async function main() {
    try {
        // Setup webhooks
        const secret = await setupWebhooks();

        // Start webhook handler server
        // setupWebhookHandler(secret);

        console.log('\n=== Webhook Setup Complete ===');
        console.log('Remember to save your webhook secret securely!');

    } catch (error) {
        console.error('Error setting up webhooks:', error);
    }
}

// For demonstration, we'll just setup webhooks
// Uncomment the line above to also start the webhook handler server
main().catch(console.error);
