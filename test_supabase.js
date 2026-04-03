const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/api/.env' });

async function checkStorage() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucketName = process.env.STORAGE_BUCKET || 'advocatus-documents';

  console.log('Testing Supabase Connection...');
  console.log('URL:', supabaseUrl);
  console.log('Bucket:', bucketName);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError.message);
      return;
    }

    console.log('Existing Buckets:', buckets.map(b => b.name).join(', '));

    const bucketExists = buckets.find(b => b.name === bucketName);
    if (!bucketExists) {
      console.log(`Bucket "${bucketName}" not found. Creating it...`);
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false
      });
      if (createError) {
        console.error('Error creating bucket:', createError.message);
      } else {
        console.log('Bucket created successfully.');
      }
    } else {
      console.log(`Bucket "${bucketName}" is ready.`);
    }
    
    // Test signed URL generation
    console.log('Testing signed URL generation...');
    const { data: signData, error: signError } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl('test-connection.txt');
      
    if (signError) {
      console.error('Error generating signed URL:', signError.message);
    } else {
      console.log('Signed URL generated successfully!');
    }

  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

checkStorage();
