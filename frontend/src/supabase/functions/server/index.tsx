import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a76bd4ad/health", (c) => {
  return c.json({ status: "ok" });
});

// User registration endpoint
app.post("/make-server-a76bd4ad/signup", async (c) => {
  try {
    const { email, password, name, idNumber, phoneNumber } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, idNumber, phoneNumber },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log(`Sign up error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      idNumber,
      phoneNumber,
      isVerified: false,
      documents: [],
      stokvels: [],
      createdAt: new Date().toISOString()
    });
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Sign up error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create Stokvel endpoint
app.post("/make-server-a76bd4ad/stokvels", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { name, description, contributionAmount, payoutCycle, maxMembers } = await c.req.json();
    
    const stokvelId = crypto.randomUUID();
    const stokvel = {
      id: stokvelId,
      name,
      description,
      contributionAmount,
      payoutCycle,
      maxMembers,
      adminId: user.id,
      members: [user.id],
      currentCycle: 1,
      totalContributions: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`stokvel:${stokvelId}`, stokvel);
    
    // Add stokvel to user's list
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.stokvels = [...(userData.stokvels || []), stokvelId];
      await kv.set(`user:${user.id}`, userData);
    }
    
    return c.json({ stokvel });
  } catch (error) {
    console.log(`Create stokvel error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Join Stokvel endpoint
app.post("/make-server-a76bd4ad/stokvels/:id/join", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const stokvelId = c.req.param('id');
    const stokvel = await kv.get(`stokvel:${stokvelId}`);
    
    if (!stokvel) {
      return c.json({ error: "Stokvel not found" }, 404);
    }
    
    if (stokvel.members.length >= stokvel.maxMembers) {
      return c.json({ error: "Stokvel is full" }, 400);
    }
    
    if (stokvel.members.includes(user.id)) {
      return c.json({ error: "Already a member" }, 400);
    }
    
    stokvel.members.push(user.id);
    await kv.set(`stokvel:${stokvelId}`, stokvel);
    
    // Add stokvel to user's list
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.stokvels = [...(userData.stokvels || []), stokvelId];
      await kv.set(`user:${user.id}`, userData);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Join stokvel error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user's stokvels
app.get("/make-server-a76bd4ad/user/stokvels", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || !userData.stokvels) {
      return c.json({ stokvels: [] });
    }
    
    const stokvels = await kv.mget(userData.stokvels.map((id: string) => `stokvel:${id}`));
    return c.json({ stokvels });
  } catch (error) {
    console.log(`Get stokvels error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get stokvel details
app.get("/make-server-a76bd4ad/stokvels/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const stokvelId = c.req.param('id');
    const stokvel = await kv.get(`stokvel:${stokvelId}`);
    
    if (!stokvel) {
      return c.json({ error: "Stokvel not found" }, 404);
    }
    
    if (!stokvel.members.includes(user.id)) {
      return c.json({ error: "Not a member of this stokvel" }, 403);
    }
    
    // Get member details
    const memberDetails = await kv.mget(stokvel.members.map((id: string) => `user:${id}`));
    
    return c.json({ 
      stokvel: {
        ...stokvel,
        memberDetails
      }
    });
  } catch (error) {
    console.log(`Get stokvel error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Record payment
app.post("/make-server-a76bd4ad/payments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { stokvelId, amount, type, reference } = await c.req.json();
    
    const paymentId = crypto.randomUUID();
    const payment = {
      id: paymentId,
      stokvelId,
      userId: user.id,
      amount,
      type, // 'contribution' or 'payout'
      reference,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`payment:${paymentId}`, payment);
    
    // Update stokvel total contributions
    const stokvel = await kv.get(`stokvel:${stokvelId}`);
    if (stokvel && type === 'contribution') {
      stokvel.totalContributions += amount;
      await kv.set(`stokvel:${stokvelId}`, stokvel);
    }
    
    return c.json({ payment });
  } catch (error) {
    console.log(`Record payment error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create emergency withdrawal request
app.post("/make-server-a76bd4ad/emergency-withdrawal", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { stokvelId, amount, reason } = await c.req.json();
    
    const requestId = crypto.randomUUID();
    const request = {
      id: requestId,
      stokvelId,
      requesterId: user.id,
      amount,
      reason,
      status: 'pending',
      votes: [],
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`emergency:${requestId}`, request);
    
    return c.json({ request });
  } catch (error) {
    console.log(`Emergency withdrawal error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Vote on emergency withdrawal
app.post("/make-server-a76bd4ad/emergency-withdrawal/:id/vote", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const requestId = c.req.param('id');
    const { vote } = await c.req.json(); // 'approve' or 'reject'
    
    const request = await kv.get(`emergency:${requestId}`);
    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }
    
    // Check if user is a member of the stokvel
    const stokvel = await kv.get(`stokvel:${request.stokvelId}`);
    if (!stokvel || !stokvel.members.includes(user.id)) {
      return c.json({ error: "Not authorized to vote" }, 403);
    }
    
    // Remove existing vote from this user if any
    request.votes = request.votes.filter((v: any) => v.userId !== user.id);
    
    // Add new vote
    request.votes.push({
      userId: user.id,
      vote,
      votedAt: new Date().toISOString()
    });
    
    // Check if 60% approval reached
    const approvals = request.votes.filter((v: any) => v.vote === 'approve').length;
    const totalMembers = stokvel.members.length;
    const approvalPercentage = (approvals / totalMembers) * 100;
    
    if (approvalPercentage >= 60) {
      request.status = 'approved';
    } else if (request.votes.length === totalMembers && approvalPercentage < 60) {
      request.status = 'rejected';
    }
    
    await kv.set(`emergency:${requestId}`, request);
    
    return c.json({ request });
  } catch (error) {
    console.log(`Vote emergency withdrawal error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get member contribution status for a stokvel
app.get("/make-server-a76bd4ad/stokvels/:id/contributions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const stokvelId = c.req.param('id');
    const stokvel = await kv.get(`stokvel:${stokvelId}`);
    
    if (!stokvel) {
      return c.json({ error: "Stokvel not found" }, 404);
    }
    
    if (!stokvel.members.includes(user.id)) {
      return c.json({ error: "Not a member of this stokvel" }, 403);
    }
    
    // Get all payments for this stokvel
    const paymentKeys = await kv.getByPrefix('payment:');
    const stokvelPayments = paymentKeys.filter(payment => 
      payment.stokvelId === stokvelId && payment.type === 'contribution'
    );
    
    // Get member details
    const memberDetails = await kv.mget(stokvel.members.map((id: string) => `user:${id}`));
    
    // Calculate contribution status for current cycle
    const currentCycle = stokvel.currentCycle;
    const memberContributions = memberDetails.map(member => {
      if (!member) return null;
      
      // Get payments for this member in current cycle
      const memberPayments = stokvelPayments.filter(payment => 
        payment.userId === member.id
      );
      
      const totalPaid = memberPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const expectedAmount = stokvel.contributionAmount * currentCycle;
      const currentCyclePayments = memberPayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        const currentDate = new Date();
        return paymentDate.getMonth() === currentDate.getMonth() && 
               paymentDate.getFullYear() === currentDate.getFullYear();
      });
      const currentCyclePaid = currentCyclePayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        isVerified: member.isVerified,
        totalPaid,
        expectedAmount,
        currentCyclePaid,
        currentCycleExpected: stokvel.contributionAmount,
        isCurrentCycleComplete: currentCyclePaid >= stokvel.contributionAmount,
        lastPaymentDate: memberPayments.length > 0 ? 
          memberPayments[memberPayments.length - 1].createdAt : null,
        paymentHistory: memberPayments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          reference: payment.reference,
          date: payment.createdAt
        }))
      };
    }).filter(member => member !== null);
    
    const totalCollectedThisCycle = memberContributions.reduce(
      (sum, member) => sum + member.currentCyclePaid, 0
    );
    const totalExpectedThisCycle = stokvel.members.length * stokvel.contributionAmount;
    
    return c.json({
      stokvelId,
      currentCycle,
      memberContributions,
      summary: {
        totalMembers: stokvel.members.length,
        membersWhoPaid: memberContributions.filter(m => m.isCurrentCycleComplete).length,
        totalCollectedThisCycle,
        totalExpectedThisCycle,
        collectionPercentage: totalExpectedThisCycle > 0 ? 
          (totalCollectedThisCycle / totalExpectedThisCycle) * 100 : 0
      }
    });
  } catch (error) {
    console.log(`Get contributions error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get payment history for a stokvel
app.get("/make-server-a76bd4ad/stokvels/:id/payments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const stokvelId = c.req.param('id');
    const stokvel = await kv.get(`stokvel:${stokvelId}`);
    
    if (!stokvel) {
      return c.json({ error: "Stokvel not found" }, 404);
    }
    
    if (!stokvel.members.includes(user.id)) {
      return c.json({ error: "Not a member of this stokvel" }, 403);
    }
    
    // Get all payments for this stokvel
    const paymentKeys = await kv.getByPrefix('payment:');
    const stokvelPayments = paymentKeys.filter(payment => payment.stokvelId === stokvelId);
    
    // Get user details for payment history
    const userIds = [...new Set(stokvelPayments.map(payment => payment.userId))];
    const users = await kv.mget(userIds.map(id => `user:${id}`));
    const userMap = Object.fromEntries(
      users.filter(user => user).map(user => [user.id, user])
    );
    
    const paymentsWithUserInfo = stokvelPayments.map(payment => ({
      ...payment,
      userName: userMap[payment.userId]?.name || 'Unknown User',
      userEmail: userMap[payment.userId]?.email || 'Unknown Email'
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ payments: paymentsWithUserInfo });
  } catch (error) {
    console.log(`Get payments error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Upload document (placeholder - in real app would handle file uploads)
app.post("/make-server-a76bd4ad/documents", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { type, fileName, fileUrl } = await c.req.json();
    
    const documentId = crypto.randomUUID();
    const document = {
      id: documentId,
      userId: user.id,
      type, // 'id', 'proof_of_address', 'bank_statement'
      fileName,
      fileUrl,
      status: 'pending_verification',
      uploadedAt: new Date().toISOString()
    };
    
    await kv.set(`document:${documentId}`, document);
    
    // Add to user's documents
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.documents = [...(userData.documents || []), documentId];
      await kv.set(`user:${user.id}`, userData);
    }
    
    return c.json({ document });
  } catch (error) {
    console.log(`Upload document error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);