const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
        }

          try {
              const supabase = createClient(
                    process.env.SUPABASE_URL,
                          process.env.SUPABASE_SERVICE_ROLE_KEY
                              );

                                  const { data, error } = await supabase
                                        .from("payments")
                                              .select(`
                                                      id,
                                                              client_id,
                                                                      project_id,
                                                                              razorpay_order_id,
                                                                                      razorpay_payment_id,
                                                                                              amount,
                                                                                                      currency,
                                                                                                              payment_type,
                                                                                                                      payment_status,
                                                                                                                              paid_at,
                                                                                                                                      created_at
                                                                                                                                            `)
                                                                                                                                                  .order("created_at", { ascending: false });

                                                                                                                                                      if (error) {
                                                                                                                                                            console.error("Admin payments fetch error:", error);
                                                                                                                                                                  return res.status(500).json({
                                                                                                                                                                          error: "Unable to fetch payments"
                                                                                                                                                                                });
                                                                                                                                                                                    }

                                                                                                                                                                                        return res.status(200).json({
                                                                                                                                                                                              success: true,
                                                                                                                                                                                                    payments: data || []
                                                                                                                                                                                                        });

                                                                                                                                                                                                          } catch (error) {
                                                                                                                                                                                                              console.error("Admin payments API error:", error);

                                                                                                                                                                                                                  return res.status(500).json({
                                                                                                                                                                                                                        error: "Server error"
                                                                                                                                                                                                                            });
                                                                                                                                                                                                                              }
                                                                                                                                                                                                                              };