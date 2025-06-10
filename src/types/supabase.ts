export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_verifications: {
        Row: {
          additional_notes: string | null
          admin_notes: string | null
          country: string
          created_at: string | null
          date_of_birth: string
          document_number: string
          document_type: string
          documents: Json
          full_address: string
          id: string
          postal_code: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          admin_notes?: string | null
          country: string
          created_at?: string | null
          date_of_birth: string
          document_number: string
          document_type: string
          documents?: Json
          full_address: string
          id?: string
          postal_code: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          admin_notes?: string | null
          country?: string
          created_at?: string | null
          date_of_birth?: string
          document_number?: string
          document_type?: string
          documents?: Json
          full_address?: string
          id?: string
          postal_code?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      balances: {
        Row: {
          created_at: string
          dzd: number
          eur: number
          gbp: number
          id: string
          investment_balance: number | null
          updated_at: string
          usd: number
          user_id: string
        }
        Insert: {
          created_at?: string
          dzd?: number
          eur?: number
          gbp?: number
          id?: string
          investment_balance?: number | null
          updated_at?: string
          usd?: number
          user_id: string
        }
        Update: {
          created_at?: string
          dzd?: number
          eur?: number
          gbp?: number
          id?: string
          investment_balance?: number | null
          updated_at?: string
          usd?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          card_number: string
          card_type: string
          created_at: string
          id: string
          is_frozen: boolean
          spending_limit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          card_number: string
          card_type: string
          created_at?: string
          id?: string
          is_frozen?: boolean
          spending_limit?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          card_number?: string
          card_type?: string
          created_at?: string
          id?: string
          is_frozen?: boolean
          spending_limit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      completed_transfers: {
        Row: {
          amount: number
          completed_at: string
          currency: string
          exchange_rate: number | null
          fees: number | null
          id: string
          recipient_balance_after: number
          recipient_balance_before: number
          recipient_id: string
          reference_number: string
          sender_balance_after: number
          sender_balance_before: number
          sender_id: string
          transfer_request_id: string
        }
        Insert: {
          amount: number
          completed_at?: string
          currency: string
          exchange_rate?: number | null
          fees?: number | null
          id?: string
          recipient_balance_after: number
          recipient_balance_before: number
          recipient_id: string
          reference_number: string
          sender_balance_after: number
          sender_balance_before: number
          sender_id: string
          transfer_request_id: string
        }
        Update: {
          amount?: number
          completed_at?: string
          currency?: string
          exchange_rate?: number | null
          fees?: number | null
          id?: string
          recipient_balance_after?: number
          recipient_balance_before?: number
          recipient_id?: string
          reference_number?: string
          sender_balance_after?: number
          sender_balance_before?: number
          sender_id?: string
          transfer_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_transfers_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_transfers_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_transfers_transfer_request_id_fkey"
            columns: ["transfer_request_id"]
            isOneToOne: false
            referencedRelation: "transfer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_transfer_limits: {
        Row: {
          created_at: string | null
          daily_limit: number
          daily_used: number
          id: string
          is_verified_user: boolean | null
          last_daily_reset: string | null
          last_monthly_reset: string | null
          monthly_limit: number
          monthly_used: number
          single_transfer_limit: number
          updated_at: string | null
          user_id: string
          verification_level: number | null
        }
        Insert: {
          created_at?: string | null
          daily_limit?: number
          daily_used?: number
          id?: string
          is_verified_user?: boolean | null
          last_daily_reset?: string | null
          last_monthly_reset?: string | null
          monthly_limit?: number
          monthly_used?: number
          single_transfer_limit?: number
          updated_at?: string | null
          user_id: string
          verification_level?: number | null
        }
        Update: {
          created_at?: string | null
          daily_limit?: number
          daily_used?: number
          id?: string
          is_verified_user?: boolean | null
          last_daily_reset?: string | null
          last_monthly_reset?: string | null
          monthly_limit?: number
          monthly_used?: number
          single_transfer_limit?: number
          updated_at?: string | null
          user_id?: string
          verification_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "instant_transfer_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_transfer_stats: {
        Row: {
          average_transfer_amount: number | null
          created_at: string | null
          fastest_transfer_time_ms: number | null
          id: string
          last_transfer_date: string | null
          success_rate: number | null
          total_received: number | null
          total_sent: number | null
          total_transfers_received: number | null
          total_transfers_sent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_transfer_amount?: number | null
          created_at?: string | null
          fastest_transfer_time_ms?: number | null
          id?: string
          last_transfer_date?: string | null
          success_rate?: number | null
          total_received?: number | null
          total_sent?: number | null
          total_transfers_received?: number | null
          total_transfers_sent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_transfer_amount?: number | null
          created_at?: string | null
          fastest_transfer_time_ms?: number | null
          id?: string
          last_transfer_date?: string | null
          success_rate?: number | null
          total_received?: number | null
          total_sent?: number | null
          total_transfers_received?: number | null
          total_transfers_sent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instant_transfer_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_transfers: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string
          description: string | null
          error_message: string | null
          exchange_rate: number | null
          fees: number | null
          id: string
          metadata: Json | null
          processed_at: string | null
          processing_time_ms: number | null
          recipient_balance_after: number | null
          recipient_balance_before: number | null
          recipient_id: string
          reference_number: string
          retry_count: number | null
          sender_balance_after: number | null
          sender_balance_before: number
          sender_id: string
          status: string
          transfer_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          error_message?: string | null
          exchange_rate?: number | null
          fees?: number | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          processing_time_ms?: number | null
          recipient_balance_after?: number | null
          recipient_balance_before?: number | null
          recipient_id: string
          reference_number: string
          retry_count?: number | null
          sender_balance_after?: number | null
          sender_balance_before: number
          sender_id: string
          status?: string
          transfer_type?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          error_message?: string | null
          exchange_rate?: number | null
          fees?: number | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          processing_time_ms?: number | null
          recipient_balance_after?: number | null
          recipient_balance_before?: number | null
          recipient_id?: string
          reference_number?: string
          retry_count?: number | null
          sender_balance_after?: number | null
          sender_balance_before?: number
          sender_id?: string
          status?: string
          transfer_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instant_transfers_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instant_transfers_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          end_date: string
          id: string
          profit: number
          profit_rate: number
          start_date: string
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date: string
          id?: string
          profit?: number
          profit_rate: number
          start_date: string
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string
          id?: string
          profit?: number
          profit_rate?: number
          start_date?: string
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          category: string
          color: string
          created_at: string
          current_amount: number
          deadline: string
          icon: string
          id: string
          name: string
          status: string | null
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          color: string
          created_at?: string
          current_amount?: number
          deadline: string
          icon: string
          id?: string
          name: string
          status?: string | null
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          current_amount?: number
          deadline?: string
          icon?: string
          id?: string
          name?: string
          status?: string | null
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      simple_balances: {
        Row: {
          account_number: string
          balance: number
          id: string
          updated_at: string | null
          user_email: string
          user_name: string
        }
        Insert: {
          account_number: string
          balance?: number
          id?: string
          updated_at?: string | null
          user_email: string
          user_name: string
        }
        Update: {
          account_number?: string
          balance?: number
          id?: string
          updated_at?: string | null
          user_email?: string
          user_name?: string
        }
        Relationships: []
      }
      simple_transfers: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          recipient_account_number: string
          recipient_email: string
          recipient_name: string
          reference_number: string
          sender_account_number: string
          sender_email: string
          sender_name: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          recipient_account_number: string
          recipient_email: string
          recipient_name: string
          reference_number: string
          sender_account_number: string
          sender_email: string
          sender_name: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          recipient_account_number?: string
          recipient_email?: string
          recipient_name?: string
          reference_number?: string
          sender_account_number?: string
          sender_email?: string
          sender_name?: string
          status?: string | null
        }
        Relationships: []
      }
      simple_transfers_users: {
        Row: {
          account_number: string | null
          can_receive_transfers: boolean | null
          created_at: string | null
          email: string
          email_normalized: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_number?: string | null
          can_receive_transfers?: boolean | null
          created_at?: string | null
          email: string
          email_normalized: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_number?: string | null
          can_receive_transfers?: boolean | null
          created_at?: string | null
          email?: string
          email_normalized?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          admin_id: string | null
          admin_response: string | null
          category: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          responded_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          admin_response?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          responded_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          admin_response?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          responded_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string
          id: string
          recipient: string | null
          reference: string | null
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description: string
          id?: string
          recipient?: string | null
          reference?: string | null
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string
          id?: string
          recipient?: string | null
          reference?: string | null
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_limits: {
        Row: {
          created_at: string
          daily_limit: number | null
          daily_used: number | null
          id: string
          last_reset_date: string | null
          monthly_limit: number | null
          monthly_used: number | null
          single_transfer_limit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_limit?: number | null
          daily_used?: number | null
          id?: string
          last_reset_date?: string | null
          monthly_limit?: number | null
          monthly_used?: number | null
          single_transfer_limit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_limit?: number | null
          daily_used?: number | null
          id?: string
          last_reset_date?: string | null
          monthly_limit?: number | null
          monthly_used?: number | null
          single_transfer_limit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_requests: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          error_message: string | null
          exchange_rate: number | null
          fees: number | null
          id: string
          processed_at: string | null
          recipient_email: string
          recipient_id: string | null
          reference_number: string
          retry_count: number | null
          scheduled_at: string | null
          sender_id: string
          status: string | null
          transfer_type: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          error_message?: string | null
          exchange_rate?: number | null
          fees?: number | null
          id?: string
          processed_at?: string | null
          recipient_email: string
          recipient_id?: string | null
          reference_number: string
          retry_count?: number | null
          scheduled_at?: string | null
          sender_id: string
          status?: string | null
          transfer_type?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          error_message?: string | null
          exchange_rate?: number | null
          fees?: number | null
          id?: string
          processed_at?: string | null
          recipient_email?: string
          recipient_id?: string | null
          reference_number?: string
          retry_count?: number | null
          scheduled_at?: string | null
          sender_id?: string
          status?: string | null
          transfer_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credentials: {
        Row: {
          created_at: string | null
          id: string
          password_hash: string
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password_hash: string
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password_hash?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      user_directory: {
        Row: {
          account_number: string
          can_receive_transfers: boolean | null
          created_at: string
          email: string
          email_normalized: string
          full_name: string
          id: string
          is_active: boolean | null
          last_activity: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          can_receive_transfers?: boolean | null
          created_at?: string
          email: string
          email_normalized: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          can_receive_transfers?: boolean | null
          created_at?: string
          email?: string
          email_normalized?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_directory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_number: string
          address: string | null
          created_at: string
          currency: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          join_date: string
          language: string | null
          location: string | null
          phone: string | null
          profile_completed: boolean | null
          profile_image: string | null
          referral_code: string
          referral_earnings: number
          registration_date: string | null
          updated_at: string
          used_referral_code: string | null
          username: string | null
          verification_status: string | null
        }
        Insert: {
          account_number: string
          address?: string | null
          created_at?: string
          currency?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          join_date: string
          language?: string | null
          location?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          profile_image?: string | null
          referral_code: string
          referral_earnings?: number
          registration_date?: string | null
          updated_at?: string
          used_referral_code?: string | null
          username?: string | null
          verification_status?: string | null
        }
        Update: {
          account_number?: string
          address?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          join_date?: string
          language?: string | null
          location?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          profile_image?: string | null
          referral_code?: string
          referral_earnings?: number
          registration_date?: string | null
          updated_at?: string
          used_referral_code?: string | null
          username?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_verification: {
        Args: {
          p_verification_id: string
          p_admin_notes?: string
          p_admin_id?: string
        }
        Returns: {
          success: boolean
          message: string
          verification_data: Json
        }[]
      }
      calculate_investment_profit: {
        Args: { investment_id: string }
        Returns: number
      }
      check_instant_transfer_limits: {
        Args: { p_user_id: string; p_amount: number }
        Returns: {
          can_transfer: boolean
          error_message: string
          daily_remaining: number
          monthly_remaining: number
          single_limit_ok: boolean
        }[]
      }
      check_transfer_limits: {
        Args: { p_user_id: string; p_amount: number }
        Returns: {
          can_transfer: boolean
          error_message: string
          daily_remaining: number
          monthly_remaining: number
        }[]
      }
      cleanup_old_transfers: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_support_message: {
        Args: {
          p_user_id: string
          p_subject: string
          p_message: string
          p_category?: string
          p_priority?: string
        }
        Returns: {
          success: boolean
          message: string
          ticket_id: string
          reference_number: string
        }[]
      }
      create_test_user: {
        Args: { test_email: string; test_password?: string; test_name?: string }
        Returns: Json
      }
      find_user_by_identifier: {
        Args: { identifier: string }
        Returns: {
          user_id: string
          email: string
          full_name: string
          account_number: string
          can_receive: boolean
          match_type: string
        }[]
      }
      find_user_simple: {
        Args: { p_identifier: string }
        Returns: {
          user_email: string
          user_name: string
          account_number: string
          balance: number
        }[]
      }
      generate_instant_transfer_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_simple_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_transfer_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_all_verifications: {
        Args: { p_limit?: number; p_offset?: number; p_status?: string }
        Returns: {
          verification_id: string
          user_id: string
          user_email: string
          user_name: string
          country: string
          date_of_birth: string
          full_address: string
          postal_code: string
          document_type: string
          document_number: string
          documents: Json
          additional_notes: string
          status: string
          submitted_at: string
          reviewed_at: string
          admin_notes: string
          days_since_submission: number
        }[]
      }
      get_instant_transfer_history: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          id: string
          amount: number
          currency: string
          description: string
          reference_number: string
          status: string
          transfer_type: string
          recipient_name: string
          recipient_email: string
          sender_name: string
          sender_email: string
          processing_time_ms: number
          created_at: string
          completed_at: string
          is_sender: boolean
        }[]
      }
      get_instant_transfer_stats: {
        Args: { p_user_id: string }
        Returns: {
          total_sent: number
          total_received: number
          total_transfers_sent: number
          total_transfers_received: number
          average_transfer_amount: number
          fastest_transfer_time_ms: number
          success_rate: number
          daily_limit: number
          daily_used: number
          daily_remaining: number
          monthly_limit: number
          monthly_used: number
          monthly_remaining: number
        }[]
      }
      get_pending_verifications: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          verification_id: string
          user_id: string
          user_email: string
          user_name: string
          country: string
          date_of_birth: string
          full_address: string
          postal_code: string
          document_type: string
          document_number: string
          documents: Json
          additional_notes: string
          status: string
          submitted_at: string
          days_pending: number
        }[]
      }
      get_system_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          total_transfers: number
          total_volume: number
          avg_transfer_amount: number
          last_transfer_time: string
        }[]
      }
      get_transfer_history_simple: {
        Args: { p_user_email: string }
        Returns: {
          id: string
          sender_email: string
          sender_name: string
          recipient_email: string
          recipient_name: string
          amount: number
          description: string
          reference_number: string
          status: string
          created_at: string
          is_sender: boolean
        }[]
      }
      get_transfer_stats_simple: {
        Args: { p_user_email: string }
        Returns: {
          total_sent: number
          total_received: number
          total_amount_sent: number
          total_amount_received: number
          last_transfer_date: string
        }[]
      }
      get_user_balance_simple: {
        Args: { p_identifier: string }
        Returns: {
          user_email: string
          user_name: string
          account_number: string
          balance: number
        }[]
      }
      get_user_investment_summary: {
        Args: { p_user_id: string }
        Returns: {
          total_invested: number
          total_profit: number
          active_investments: number
          completed_investments: number
          investment_balance: number
        }[]
      }
      get_user_support_messages: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          id: string
          subject: string
          message: string
          status: string
          priority: string
          category: string
          admin_response: string
          responded_at: string
          created_at: string
          updated_at: string
        }[]
      }
      get_verification_documents: {
        Args: { p_verification_id: string }
        Returns: {
          verification_id: string
          user_email: string
          user_name: string
          documents: Json
          document_type: string
          document_number: string
          status: string
          submitted_at: string
        }[]
      }
      get_verification_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_requests: number
          pending_requests: number
          approved_requests: number
          rejected_requests: number
          under_review_requests: number
        }[]
      }
      handle_new_user_manual: {
        Args: { user_id: string; user_email: string; user_metadata?: Json }
        Returns: boolean
      }
      normalize_email: {
        Args: { email_input: string }
        Returns: string
      }
      process_instant_transfer: {
        Args: {
          p_sender_id: string
          p_recipient_identifier: string
          p_amount: number
          p_currency?: string
          p_description?: string
        }
        Returns: {
          success: boolean
          message: string
          reference_number: string
          transfer_id: string
          sender_new_balance: number
          recipient_new_balance: number
          processing_time_ms: number
        }[]
      }
      process_investment: {
        Args: { p_user_id: string; p_amount: number; p_operation: string }
        Returns: {
          success: boolean
          message: string
          new_dzd_balance: number
          new_investment_balance: number
        }[]
      }
      process_money_transfer: {
        Args: {
          p_sender_id: string
          p_recipient_identifier: string
          p_amount: number
          p_currency?: string
          p_description?: string
        }
        Returns: {
          success: boolean
          message: string
          reference_number: string
          sender_new_balance: number
          recipient_new_balance: number
          transfer_id: string
        }[]
      }
      process_simple_transfer: {
        Args: {
          p_sender_email: string
          p_recipient_identifier: string
          p_amount: number
          p_description?: string
        }
        Returns: {
          success: boolean
          message: string
          reference_number: string
          sender_new_balance: number
        }[]
      }
      process_transfer: {
        Args: {
          p_sender_id: string
          p_recipient_identifier: string
          p_amount: number
        }
        Returns: {
          success: boolean
          message: string
          new_sender_balance: number
          new_recipient_balance: number
        }[]
      }
      reject_verification: {
        Args: {
          p_verification_id: string
          p_admin_notes?: string
          p_admin_id?: string
        }
        Returns: {
          success: boolean
          message: string
          verification_data: Json
        }[]
      }
      safe_create_user_profile: {
        Args: { user_id: string; user_email: string; user_metadata?: Json }
        Returns: boolean
      }
      sync_user_to_directory: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_support_message_status: {
        Args: {
          p_message_id: string
          p_status: string
          p_admin_response?: string
          p_admin_id?: string
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      update_user_balance: {
        Args: {
          p_user_id: string
          p_dzd?: number
          p_eur?: number
          p_usd?: number
          p_gbp?: number
          p_investment_balance?: number
        }
        Returns: {
          user_id: string
          dzd: number
          eur: number
          usd: number
          gbp: number
          investment_balance: number
          updated_at: string
        }[]
      }
      update_user_balance_simple: {
        Args: { p_identifier: string; p_new_balance: number }
        Returns: {
          success: boolean
          message: string
          new_balance: number
        }[]
      }
      user_exists_and_active: {
        Args: { user_id: string }
        Returns: boolean
      }
      validate_currency_code: {
        Args: { currency_code: string }
        Returns: boolean
      }
      validate_transaction_type: {
        Args: { transaction_type: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
