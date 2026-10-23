export type Law = { key: string; name: string; number: string; category: string; summary: string };

export const LAWS: Law[] = [
  { key: "constitution", name: "دستور جمهورية العراق", number: "لسنة 2005", category: "دستوري", summary: "القانون الأسمى، يحدد شكل الدولة والحقوق والحريات والسلطات الاتحادية." },
  { key: "civil", name: "القانون المدني", number: "رقم 40 لسنة 1951", category: "مدني", summary: "ينظم الالتزامات والعقود والمسؤولية التقصيرية والحقوق العينية." },
  { key: "penal", name: "قانون العقوبات", number: "رقم 111 لسنة 1969", category: "جزائي", summary: "يحدد الجرائم والعقوبات والمسؤولية الجزائية." },
  { key: "personal", name: "قانون الأحوال الشخصية", number: "رقم 188 لسنة 1959", category: "أحوال شخصية", summary: "الزواج والطلاق والنفقة والحضانة والنسب والوصية والميراث." },
  { key: "civil-procedure", name: "قانون المرافعات المدنية", number: "رقم 83 لسنة 1969", category: "إجرائي", summary: "إجراءات إقامة الدعوى والتبليغ والأحكام وطرق الطعن." },
  { key: "criminal-procedure", name: "قانون أصول المحاكمات الجزائية", number: "رقم 23 لسنة 1971", category: "إجرائي", summary: "التحقيق والقبض والتوقيف والمحاكمة والطعن في الأحكام الجزائية." },
  { key: "evidence", name: "قانون الإثبات", number: "رقم 107 لسنة 1979", category: "إجرائي", summary: "طرق الإثبات: الأدلة الكتابية والشهادة والإقرار واليمين والخبرة." },
  { key: "commerce", name: "قانون التجارة", number: "رقم 30 لسنة 1984", category: "تجاري", summary: "الأعمال التجارية والأوراق التجارية والعقود التجارية." },
  { key: "companies", name: "قانون الشركات", number: "رقم 21 لسنة 1997", category: "تجاري", summary: "تأسيس الشركات وأنواعها وإدارتها وتصفيتها." },
  { key: "labor", name: "قانون العمل", number: "رقم 37 لسنة 2015", category: "عمل", summary: "علاقات العمل والأجور وساعات العمل وحقوق العمال." },
  { key: "lawyers", name: "قانون المحاماة", number: "رقم 173 لسنة 1965", category: "مهني", summary: "تنظيم مهنة المحاماة وحقوق المحامي وواجباته والأتعاب." },
  { key: "minors", name: "قانون رعاية القاصرين", number: "رقم 78 لسنة 1980", category: "أحوال شخصية", summary: "الولاية والوصاية والقيمومة وأموال القاصرين." },
  { key: "execution", name: "قانون التنفيذ", number: "رقم 45 لسنة 1980", category: "إجرائي", summary: "تنفيذ الأحكام والسندات التنفيذية والحجز." },
  { key: "rent", name: "قانون إيجار العقار", number: "رقم 87 لسنة 1979", category: "مدني", summary: "العلاقة بين المؤجر والمستأجر وأسباب التخلية." },
  { key: "judicial-fees", name: "قانون الرسوم العدلية", number: "رقم 114 لسنة 1981", category: "إجرائي", summary: "الرسوم القضائية المستوفاة على الدعاوى والمعاملات." },
];

/** Common appeal deadlines under Iraqi procedure (days from notification/ruling). */
export const DEADLINES = [
  { key: "objection", label: "الاعتراض على الحكم الغيابي", days: 10 },
  { key: "appeal", label: "الاستئناف", days: 15 },
  { key: "cassation", label: "التمييز (مدني)", days: 30 },
  { key: "correction", label: "تصحيح القرار التمييزي", days: 7 },
  { key: "cassation-criminal", label: "التمييز (جزائي)", days: 30 },
];
