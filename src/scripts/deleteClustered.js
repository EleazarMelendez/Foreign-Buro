// Instructs configuration on how to access the .env file

require('dotenv').config()

// Imports Supabase hook >>

const { createClient } = require("@supabase/supabase-js");

// Defines values used in Supabase hook >>

const supabaseUrl = 'https://bhzxwvltfuqsmnhgqjrf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteClustered () {
    const { data, error } = await supabase
    .from('ClusteredArticles')
    .delete()
    .neq('country', '100')
    
    if (error) {
      console.error(error);
    } else {
      console.log(`Deleted all from Clustered Articles`);
    }
  
  };

module.exports = { deleteClustered };