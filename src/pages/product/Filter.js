import { Button, Dropdown } from "react-bootstrap";

export const FILTER_OPTIONS = {
  category: [
    { value: null, label: "전체" },
    { value: "REFRIGERATOR", label: "냉장고" },
    { value: "WASHER", label: "세탁기" },
    { value: "DRYER", label: "건조기" },
    { value: "AIRCON", label: "에어컨" },
    { value: "TV", label: "티비" },
    { value: "OVEN", label: "오븐" },
    { value: "MICROWAVE", label: "전자레인지" },
    { value: "OTHER", label: "기타" },
  ],
  brand: [
    { value: null, label: "전체" },
    { value: "SAMSUNG", label: "삼성" },
    { value: "LG", label: "LG" },
    { value: "DAEWOO", label: "대우" },
    { value: "WINIA", label: "위니아" },
    { value: "CUCKOO", label: "쿠쿠" },
    { value: "SK_MAGIC", label: "SK MAGIC" },
  ],
  available: [
    { value: null, label: "전체" },
    { value: true, label: "대여가능" },
    { value: false, label: "대여불가" },
  ],
  sortBy: [
    { value: null, label: "최신순 (기본)" },
    { value: "POPULAR", label: "판매량순" },
    { value: "RATING_DESC", label: "평점순" },
    { value: "PRICE_ASC", label: "가격 낮은순" },
    { value: "PRICE_DESC", label: "가격 높은순" },
  ]
};

export const BrandDropdown = ({ brand, setBrand }) => {
  const options = FILTER_OPTIONS.brand;
  const toggleBrand = (value) => {
    if (value === null) { setBrand([]); return; }
    setBrand(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };
  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary">브랜드</Dropdown.Toggle>
      <Dropdown.Menu>
        {options.map(o => (
          <Dropdown.Item
            key={o.value}
            active={o.value === null ? brand.length === 0 : brand.includes(o.value)}
            onClick={() => toggleBrand(o.value)}
          >
            {o.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export const AvailabilityDropdown = ({ available, setAvailable }) => {
  const options = FILTER_OPTIONS.available;
  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary">상태</Dropdown.Toggle>
      <Dropdown.Menu>
        {options.map(o => (
          <Dropdown.Item key={o.value} active={o.value === available} onClick={() => setAvailable(o.value)}>{o.label}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export const SortDropdown = ({ sortBy, setSortBy }) => {
  const options = FILTER_OPTIONS.sortBy;
  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary">정렬</Dropdown.Toggle>
      <Dropdown.Menu>
        {options.map(o => (
          <Dropdown.Item key={o.value} active={o.value === sortBy} onClick={() => setSortBy(o.value)}>{o.label}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );  
};


export const SelectedFilter = ({ category, setCategory, brand, setBrand, available, setAvailable, sortBy, setSortBy }) => {
  return (
    <div className="d-flex flex-wrap gap-2 mt-2">
      {category.map(c => (
        <Button
          key={c}
          variant="secondary"
          size="sm"
          className="rounded-pill px-3 py-0"
          onClick={() => setCategory(prev => prev.filter(v => v !== c))}
        >
          {FILTER_OPTIONS.category.find(o => o.value === c)?.label} ✕
        </Button>
      ))}

      {brand.map(b => (
        <Button
          key={b}
          variant="secondary"
          size="sm"
          className="rounded-pill px-3 py-0"
          onClick={() => setBrand(prev => prev.filter(v => v !== b))}
        >
          {FILTER_OPTIONS.brand.find(o => o.value === b)?.label} ✕
        </Button>
      ))}
    
      {available !== null && (
        <Button
          variant="secondary"
          size="sm"
          className="rounded-pill px-3 py-0"
          onClick={() => setAvailable(null)}
        >
          {FILTER_OPTIONS.available.find(o => o.value === available)?.label} ✕
        </Button>
      )}
      {sortBy && (
        <Button
          variant="secondary"
          size="sm"
          className="rounded-pill px-3 py-0"
          onClick={() => setSortBy(null)}
        >
          {FILTER_OPTIONS.sortBy.find(o => o.value === sortBy)?.label} ✕
        </Button>
      )}
    </div>
  );
}