export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categories: string[];
  imageUrls: string[];
  metadata: {
    ingredients?: string[];
    dosage?: string;
    size?: string;
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Karpoora Thulasi DX",
    description: "Authentic Ayurvedic cough & cold remedy enriched with Thulasi & Mulethi extracts for fast relief.",
    price: 18.50,
    stockQuantity: 422,
    categories: ["Respiratory", "Cough & Cold"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuB_YiAXZSxHX16NBtaR1knEsJ-5EDiMOvUWVG_Pm8E_nsEHxrUbfGTTjZAH3ZTQ1beCTxhnclnEujqLijfktAj4TCPD_zjK8B2iSJlJUnO7JKAq3x2HIvFeTOTLo1MHMdBdeXj78BKmtpav7kA0n_7aC42x19ZGbHFlmluQNDhEbxru3n0qkJhkXjcMlnrA4tb6SIDp0cC8pm25mrX8ag9_0AeNVw3GJ2SgTXVQzTxzsPob0VVhd1jktpTzc_4BPq2s3ara-_Q-uuQ"],
    metadata: { ingredients: ["Thulasi", "Mulethi", "Karpoora"], dosage: "Take 10ml thrice daily after meals", size: "200ml" },
  },
  {
    id: "prod-2",
    name: "Amrit Kalash Paste",
    description: "Synergistic blend of 53 herbs to strengthen natural defenses and boost vitality levels.",
    price: 42.00,
    stockQuantity: 24,
    categories: ["Immunity", "Daily Health"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDGF68ViWIxhJYciECVlPl8NYTz1yPpOemtk0I-e4kbC0b5LTsQw0-crE_rYrCRYVQuUW7eGHF5OUN1c8oPdazhOvEN2aSrjD1wU9GhVP642DoxQqwn4W_FH87BYcZ8Bkl1iX1onHGj3IuV8jM5MvdBmRvO-Uk3RaGzM_6PO1denGeJR7JCEF3kGyovcjK5-tmZoceNBfybStJQUtVOTwK2WqVvSFvwTM_lQyZQZbgqB7MXrk4sA6qnEpjsIoaXO-HAxBABR4HzMg0"],
    metadata: { ingredients: ["Amla", "Haritaki", "Sandalwood"], dosage: "Take 1 teaspoon twice daily with warm milk or water", size: "500g" },
  },
  {
    id: "prod-3",
    name: "Triphala Gold Tabs",
    description: "Ancient triple-fruit formula for gentle detoxification and optimal digestive health.",
    price: 24.00,
    stockQuantity: 15,
    categories: ["Digestive", "Detox"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBDxw6LP_r20Qy8bf9LYo5i7y_9W2GyknPmCyyoyLexb_ryiqSxCXB4UYIFFdKlS8URL4xHblJrKe8YST_J6zzXyc1ivqAsSGoenr_yHKJCDIgNZsCqAOD9_2VvuYKPfbVE_I7MdkAA_9_d_7ipbZchqqXN_EP47hGSvfwJ54kRl9zuTms013akoZkm7Mj2taOXK_37lD-JogNMRS0gcYvwJ8CXxsUu5rjHe4kRPIYS_I7HDcv3cD1hxIbIoEbbz2Jri9YHgYKOJ84"],
    metadata: { ingredients: ["Amalaki", "Bibhitaki", "Haritaki"], dosage: "1-2 tablets at bedtime with warm water", size: "60 Tablets" },
  },
  {
    id: "prod-4",
    name: "Ashwagandha Elixir",
    description: "Pure adaptogenic root extract to support healthy stress response and cognitive function.",
    price: 32.99,
    stockQuantity: 12,
    categories: ["Wellness", "Stress Relief"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuD2zVINomi8gxIGe77r8VmeXSRFTIRpt5IV32PvAr7NlcdOam8LG9L6Zws7NWLmu05RuzfMORLk-4Rzb3IExiRVSu-sFMVCYE7_joa5c3_GnrP9yUuRNophvl9Eq0-7Csewetim8ZC_1HusbyuGHdDX9KcE2bYZpr9AQWOPmVpOZ9oHdH2XdWvxGr_E_3BMjYUmKuSk4I59xPSBw63fvES7Zf2HYmkIWqL9aAKiggwcAo6YDlOqof4NKYQSL8bVk2f335ZQ_Poy73s"],
    metadata: { ingredients: ["Ashwagandha Root Extract"], dosage: "Take 15 drops in water twice daily", size: "100ml" },
  },
  {
    id: "prod-5",
    name: "Mahanarayan Oil",
    description: "Traditional warm massage oil with over 50 botanicals to support joint mobility and flexibility.",
    price: 21.50,
    stockQuantity: 88,
    categories: ["Joint Care", "Massage"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBT9wAkUeYu71a1yCHgSW9IZk_DPED9DLNxAafg33k0nVJX8guN0kxosGh4xuWGfLkZBULQ2eG-h8ZVwsV4Xe-fC3KDImKz18fb78GqnN_yEwpYKIY71mJ9quckaMhddbvF6a2IgEbmXNSbBecNwCkBWZRT6pctXvtSyq5BRcvQOfctIddQjPJrn4MAY3iVyXbuA12tFA4tCTRjJwl3RlLfvsVVO-PYGJPIafl98SerMljLB-MIuj_YyIgCvEc7s3PfEmrU-_qxybI"],
    metadata: { ingredients: ["Shatavari", "Ashwagandha", "Bala"], dosage: "Gently massage warm oil onto affected joints", size: "200ml" },
  },
  {
    id: "prod-6",
    name: "Liv-Right Detox",
    description: "Hepatoprotective blend containing Bhumyamalaki and Katuki to maintain healthy liver function.",
    price: 28.00,
    stockQuantity: 62,
    categories: ["Digestive", "Detox"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDuarS2O1wuE52VABp5ps_xzKjJiyLPkfbjbx6Uvt7xfotaWopTV35Y4b4Ew4kIxa_tfyBATCcrN9-puo3hC4vXTZKMWUSR6jwYTlwKPtSo6ffDuVcbs1tH62eMIb7sX_uygk7fRC0wPG4yl7nUwvDP3m0fNhIoO8KkbkCmZUmE5hZsO8AEh-JWaAol4AL9C3NBH_xaDHz5-J_KS0ITharMyr2U5iQkc632lfb8jcKpV7tsIDYAJEyY1M4DvAXUDn4bsUdplpyR8n0"],
    metadata: { ingredients: ["Bhumyamalaki", "Katuki", "Punarnava"], dosage: "1 capsule twice daily before meals", size: "60 Capsules" },
  },
  {
    id: "prod-7",
    name: "Nidra Deep Sleep",
    description: "Calming botanical tea blend designed to quiet the mind and promote restful, uninterrupted sleep.",
    price: 19.99,
    stockQuantity: 41,
    categories: ["Wellness", "Sleep Support"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCydWVoMBf6KendSWgecRoLeISutS0BeMvgbSaMNvKMNP4lJ_Fmfv4mBQc2loG1UiJczOm57cqLYc4WFkw75ppUH0KZOJTk6aqypDJKJcJlXTN2F7efPtr7R4fgJr-3Ms3ZUYB0tmO7XhbtWnsl1s-IKa__TRtCCEBFDaBe37VLKUhY1pvS4SH5oy2HB0Zz4ewXSpKs3pYtO8ChBHQi2IHyTvUvIQoWtjz2DyDscq5HmtUB4JIsMVEQTL-Cjg1c1v1uTina9nHElZI"],
    metadata: { ingredients: ["Chamomile", "Brahmi", "Shankhpushpi"], dosage: "Steep 1 tea bag in hot water 30 mins before bedtime", size: "20 Tea Bags" },
  },
  {
    id: "prod-8",
    name: "Kumkumadi Glow",
    description: "Precious saffron-based facial oil for skin brightening, anti-aging, and a youthful complexion.",
    price: 55.00,
    stockQuantity: 18,
    categories: ["Skin Care", "Beauty"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCiCSoWw2G9f1DvX2in9u7V2D9lDTAafsQ6UllC5Mx6wUMS0I3zGkOfs2TyYgfzOfzQzWmXCAND_wUXPs835SX2xVE9qSRJRj96iJnPCSiIzeqviBrLU6Spl2A43YDrN1ZatytxMOI4rSIwqXTbXOyGPvsMkJKDv2wir8bm5UElefYrqSGKkGvao6n5oiq7oqRqSE_jjdhtuOG-rKMgCYFhAQQd--JJE3OXM_5iuGESk-u9-SArnj0ohHjaM3_vq_DuvjblH3DVA0g"],
    metadata: { ingredients: ["Saffron", "Lotus Stems", "Sandalwood"], dosage: "Apply 3-4 drops to clean face at night", size: "30ml" },
  },
];
