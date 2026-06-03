import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cuiekfporakxgfuokage.supabase.co'
const supabaseKey = 'sb_publishable_SgXF1jPma5BxCQlDqeTC1Q_ziIMQcKB'

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)