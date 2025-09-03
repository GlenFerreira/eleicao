export interface Question {
  id: string
  questionText: string
  questionType: 'text' | 'multiple_choice' | 'rating'
  isRequired: boolean
  orderIndex: number
  options: QuestionOption[]
}

export interface QuestionOption {
  id: string
  optionText: string
  optionValue: string
  orderIndex: number
}

export interface SurveyForm {
  title: string
  description: string
  isActive: boolean
  questions: Question[]
  collectContactInfo: {
    name: boolean
    email: boolean
    phone: boolean
    newsletter: boolean
  }
}

export interface Survey {
  id: string
  company_id: string
  title: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface QuestionDB {
  id: string
  survey_id: string
  question_text: string
  question_type: 'text' | 'multiple_choice' | 'rating'
  is_required: boolean
  order_index: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface QuestionOptionDB {
  id: string
  question_id: string
  option_text: string
  option_value: string
  order_index: number
  is_correct: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}
