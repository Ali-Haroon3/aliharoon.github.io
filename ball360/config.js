// Set your project's public URL and publishable key to enable shared features.
window.BALL360_CONFIG = {
  supabaseUrl: '',
  supabasePublishableKey: '',
  sharedScores: false,
  sharedQuestions: false,
};

async function connectSupabase(options) {
  const {supabaseUrl, supabasePublishableKey} = window.BALL360_CONFIG;
  if (!supabaseUrl || !supabasePublishableKey) return null;
  if (!window.supabase) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  return window.supabase.createClient(supabaseUrl, supabasePublishableKey, options);
}
