export interface MediaContent {
  title: string;
  kind: 'video' | 'image';
  content_id: number;
  link: string;
  id: number;
  created_at: string;
}

export interface Category {
  description: string | null;
  id: number;
  code: string;
  name: string;
  sector: string;
}

export interface Content {
  title: string;
  id: number;
  category_id: number;
  hashtag: string;
  content: string;
  created_at: string;
  slug: string;
  category: Category;
  media_contents: MediaContent[];
}

export interface Merchandise {
  code: string;
  description_in_quotation: string | null;
  name: string;
  data_sheet_link: string | null;
  unit: string;
  template_id: number;
  description_in_contract: string;
  id: number;
  data_json: Record<string, any>;
  brand_id: number;
  created_at: string;
  supplier_id: number | null;
  active: boolean;
  template: {
    sector_id: number;
    id: number;
    gm: number;
    name: string;
    code: string;
    structure_json: any;
  };
  images: Array<{
    id: number;
    merchandise_id: number;
    link: string;
  }>;
}

export interface PreQuoteMerchandise {
  id: number;
  note: string | null;
  price: number;
  pre_quote_id: number;
  merchandise_id: number;
  quantity: number;
  gm: number;
  merchandise: Merchandise;
}

export interface GroupedMerchandise {
  template: {
    sector_id: number;
    id: number;
    gm: number;
    name: string;
    code: string;
    structure_json: any;
    image_rectangular?: string;
  };
  pre_quote_merchandises: PreQuoteMerchandise[];
}

export interface Combo {
  id: number;
  name: string;
  description?: string;
  image?: string;
  image_rectangular?: string;
  total_price: number;
  type?: 'DOC_LAP_MOT_PHA' | 'DOC_LAP_BA_PHA' | 'BAM_TAI_MOT_PHA' | 'BAM_TAI_BA_PHA';
  power_output?: string;
  capacity?: string;
  status: string;
  sector: string;
  code: string;
  created_at: string;
  installation_type: string;
  best_selling?: boolean;
  customer_id: number | null;
  customer: any;
  pre_quote_merchandises: any[];
  grouped_merchandises: GroupedMerchandise[];
  payback_period?: number;
}

export interface Sector {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  image: string;
  image_rectangular: string;
  sale_phone: string | null;
  list_combos?: Combo[];
  list_contents: Content[];
} 