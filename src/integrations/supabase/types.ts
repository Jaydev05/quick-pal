export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Relationships: []
      }
      application_status_history: {
        Row: {
          application_id: string
          candidate_visible_note: string | null
          changed_by: string | null
          created_at: string
          id: string
          internal_note: string | null
          new_status: Database["public"]["Enums"]["application_status"]
          previous_status:
            | Database["public"]["Enums"]["application_status"]
            | null
        }
        Insert: {
          application_id: string
          candidate_visible_note?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          internal_note?: string | null
          new_status: Database["public"]["Enums"]["application_status"]
          previous_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
        }
        Update: {
          application_id?: string
          candidate_visible_note?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          internal_note?: string | null
          new_status?: Database["public"]["Enums"]["application_status"]
          previous_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          application_code: string
          applied_at: string
          assigned_recruiter_id: string | null
          candidate_id: string
          cover_note: string | null
          current_status: Database["public"]["Enums"]["application_status"]
          id: string
          internal_notes: string | null
          job_id: string
          resume_path: string | null
          updated_at: string
        }
        Insert: {
          application_code: string
          applied_at?: string
          assigned_recruiter_id?: string | null
          candidate_id: string
          cover_note?: string | null
          current_status?: Database["public"]["Enums"]["application_status"]
          id?: string
          internal_notes?: string | null
          job_id: string
          resume_path?: string | null
          updated_at?: string
        }
        Update: {
          application_code?: string
          applied_at?: string
          assigned_recruiter_id?: string | null
          candidate_id?: string
          cover_note?: string | null
          current_status?: Database["public"]["Enums"]["application_status"]
          id?: string
          internal_notes?: string | null
          job_id?: string
          resume_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      interviews: {
        Row: {
          application_id: string
          created_at: string
          id: string
          interview_date: string | null
          interview_time: string | null
          interviewer: string | null
          location_or_link: string | null
          mode: string | null
          notes: string | null
          status: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          interview_date?: string | null
          interview_time?: string | null
          interviewer?: string | null
          location_or_link?: string | null
          mode?: string | null
          notes?: string | null
          status?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          interview_date?: string | null
          interview_time?: string | null
          interviewer?: string | null
          location_or_link?: string | null
          mode?: string | null
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          accepting_applications: boolean
          additional_info: string | null
          benefits: string | null
          category_id: string | null
          city: string | null
          client_name: string | null
          country: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          department: string | null
          description: string
          education: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          id: string
          instagram_posted: boolean
          instagram_url: string | null
          internal_notes: string | null
          is_featured: boolean
          is_public: boolean
          job_code: string
          max_experience: number | null
          min_experience: number
          openings: number
          poster_path: string | null
          qualifications: string | null
          responsibilities: string | null
          salary_max: number | null
          salary_min: number | null
          salary_visible: boolean
          skills: string[]
          slug: string
          social_caption: string | null
          state: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          accepting_applications?: boolean
          additional_info?: string | null
          benefits?: string | null
          category_id?: string | null
          city?: string | null
          client_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department?: string | null
          description?: string
          education?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          id?: string
          instagram_posted?: boolean
          instagram_url?: string | null
          internal_notes?: string | null
          is_featured?: boolean
          is_public?: boolean
          job_code: string
          max_experience?: number | null
          min_experience?: number
          openings?: number
          poster_path?: string | null
          qualifications?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_visible?: boolean
          skills?: string[]
          slug: string
          social_caption?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          accepting_applications?: boolean
          additional_info?: string | null
          benefits?: string | null
          category_id?: string | null
          city?: string | null
          client_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department?: string | null
          description?: string
          education?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          id?: string
          instagram_posted?: boolean
          instagram_url?: string | null
          internal_notes?: string | null
          is_featured?: boolean
          is_public?: boolean
          job_code?: string
          max_experience?: number | null
          min_experience?: number
          openings?: number
          poster_path?: string | null
          qualifications?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_visible?: boolean
          skills?: string[]
          slug?: string
          social_caption?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          application_id: string
          candidate_visible: boolean
          created_at: string
          id: string
          internal_note: string | null
          payment_date: string | null
          payment_method: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount?: number
          application_id: string
          candidate_visible?: boolean
          created_at?: string
          id?: string
          internal_note?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          application_id?: string
          candidate_visible?: boolean
          created_at?: string
          id?: string
          internal_note?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          current_job_title: string | null
          education: string | null
          email: string | null
          expected_salary: number | null
          experience_years: number | null
          full_name: string
          id: string
          phone: string | null
          preferred_category_id: string | null
          preferred_location: string | null
          resume_name: string | null
          resume_path: string | null
          resume_uploaded_at: string | null
          skills: string[]
          state: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          current_job_title?: string | null
          education?: string | null
          email?: string | null
          expected_salary?: number | null
          experience_years?: number | null
          full_name?: string
          id: string
          phone?: string | null
          preferred_category_id?: string | null
          preferred_location?: string | null
          resume_name?: string | null
          resume_path?: string | null
          resume_uploaded_at?: string | null
          skills?: string[]
          state?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          current_job_title?: string | null
          education?: string | null
          email?: string | null
          expected_salary?: number | null
          experience_years?: number | null
          full_name?: string
          id?: string
          phone?: string | null
          preferred_category_id?: string | null
          preferred_location?: string | null
          resume_name?: string | null
          resume_path?: string | null
          resume_uploaded_at?: string | null
          skills?: string[]
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_pref_cat_fk"
            columns: ["preferred_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          job_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          job_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      service_enquiries: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string
          enquiry_code: string
          id: string
          message: string
          name: string
          notes: string | null
          phone: string
          service: string
          status: Database["public"]["Enums"]["enquiry_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email: string
          enquiry_code?: string
          id?: string
          message: string
          name: string
          notes?: string | null
          phone: string
          service: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string
          enquiry_code?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          phone?: string
          service?: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      next_job_code: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "recruiter" | "candidate"
      application_status:
        | "applied"
        | "under_review"
        | "shortlisted"
        | "interview_scheduled"
        | "interview_completed"
        | "document_verification"
        | "offer_released"
        | "selected"
        | "placed"
        | "payment_completed"
        | "rejected"
        | "withdrawn"
        | "on_hold"
        | "not_responding"
      employment_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "temporary"
        | "internship"
      enquiry_status:
        | "new"
        | "contacted"
        | "in_progress"
        | "converted"
        | "closed"
      job_status:
        | "draft"
        | "published"
        | "hiring"
        | "interviewing"
        | "on_hold"
        | "closed"
        | "filled"
        | "expired"
      payment_status:
        | "not_applicable"
        | "pending"
        | "partially_paid"
        | "paid"
        | "failed"
        | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "recruiter", "candidate"],
      application_status: [
        "applied",
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "interview_completed",
        "document_verification",
        "offer_released",
        "selected",
        "placed",
        "payment_completed",
        "rejected",
        "withdrawn",
        "on_hold",
        "not_responding",
      ],
      employment_type: [
        "full_time",
        "part_time",
        "contract",
        "temporary",
        "internship",
      ],
      enquiry_status: [
        "new",
        "contacted",
        "in_progress",
        "converted",
        "closed",
      ],
      job_status: [
        "draft",
        "published",
        "hiring",
        "interviewing",
        "on_hold",
        "closed",
        "filled",
        "expired",
      ],
      payment_status: [
        "not_applicable",
        "pending",
        "partially_paid",
        "paid",
        "failed",
        "refunded",
      ],
    },
  },
} as const
