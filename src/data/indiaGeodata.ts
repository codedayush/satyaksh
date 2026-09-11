// Complete Geospatial & Administrative metadata for all 28 States and 8 Union Territories in India

export interface StateInfo {
  id?: string;
  code: string;
  name: string;
  type: 'STATE' | 'UT';
  center: [number, number];
  zoom: number;
  capital: string;
  districts: string[];
  zone: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East' | 'Islands';
}

export type StateGeodata = StateInfo;

export const ALL_INDIA_STATES_AND_UTS: StateInfo[] = [
  // --- 28 STATES ---
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    type: 'STATE',
    center: [15.9129, 79.7400],
    zoom: 7,
    capital: 'Amaravati',
    districts: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool', 'Nellore', 'Kakinada', 'Anantapur', 'Kadapa', 'Srikakulam'],
    zone: 'South'
  },
  {
    code: 'AR',
    name: 'Arunachal Pradesh',
    type: 'STATE',
    center: [28.2180, 94.7278],
    zoom: 7,
    capital: 'Itanagar',
    districts: ['Papum Pare', 'Tawang', 'West Kameng', 'East Siang', 'Changlang', 'Lower Subansiri', 'Ziro', 'Dibang Valley'],
    zone: 'North-East'
  },
  {
    code: 'AS',
    name: 'Assam',
    type: 'STATE',
    center: [26.2006, 92.9376],
    zoom: 7,
    capital: 'Dispur',
    districts: ['Kamrup Metropolitan', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Cachar', 'Bongaigaon'],
    zone: 'North-East'
  },
  {
    code: 'BR',
    name: 'Bihar',
    type: 'STATE',
    center: [25.0961, 85.3131],
    zoom: 7,
    capital: 'Patna',
    districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Rohtas', 'Nalanda', 'Saran', 'Begusarai', 'Vaishali'],
    zone: 'East'
  },
  {
    code: 'CG',
    name: 'Chhattisgarh',
    type: 'STATE',
    center: [21.2787, 81.8661],
    zoom: 7,
    capital: 'Raipur',
    districts: ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur', 'Raigarh', 'Bastar'],
    zone: 'Central'
  },
  {
    code: 'GA',
    name: 'Goa',
    type: 'STATE',
    center: [15.2993, 74.1240],
    zoom: 9,
    capital: 'Panaji',
    districts: ['North Goa', 'South Goa', 'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
    zone: 'West'
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    type: 'STATE',
    center: [22.2587, 71.1924],
    zoom: 7,
    capital: 'Gandhinagar',
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Kutch', 'Bharuch', 'Mehsana'],
    zone: 'West'
  },
  {
    code: 'HR',
    name: 'Haryana',
    type: 'STATE',
    center: [29.0588, 76.0856],
    zoom: 7,
    capital: 'Chandigarh',
    districts: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Karnal', 'Rohtak', 'Sonipat', 'Panchkula', 'Yamunanagar'],
    zone: 'North'
  },
  {
    code: 'HP',
    name: 'Himachal Pradesh',
    type: 'STATE',
    center: [31.1048, 77.1734],
    zoom: 7,
    capital: 'Shimla',
    districts: ['Shimla', 'Kangra', 'Mandi', 'Kullu', 'Solan', 'Sirmaur', 'Chamba', 'Hamirpur', 'Una', 'Bilaspur', 'Kinnaur'],
    zone: 'North'
  },
  {
    code: 'JH',
    name: 'Jharkhand',
    type: 'STATE',
    center: [23.6102, 85.2799],
    zoom: 7,
    capital: 'Ranchi',
    districts: ['Ranchi', 'East Singhbhum (Jamshedpur)', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Palamu', 'Ramgarh'],
    zone: 'East'
  },
  {
    code: 'KA',
    name: 'Karnataka',
    type: 'STATE',
    center: [15.3173, 75.7139],
    zoom: 7,
    capital: 'Bengaluru',
    districts: ['Bengaluru Urban', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Ballari', 'Shivamogga', 'Tumakuru', 'Udupi'],
    zone: 'South'
  },
  {
    code: 'KL',
    name: 'Kerala',
    type: 'STATE',
    center: [10.8505, 76.2711],
    zoom: 7,
    capital: 'Thiruvananthapuram',
    districts: ['Thiruvananthapuram', 'Ernakulam (Kochi)', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur', 'Alappuzha', 'Kottayam', 'Malappuram'],
    zone: 'South'
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    type: 'STATE',
    center: [22.9734, 78.6569],
    zoom: 6,
    capital: 'Bhopal',
    districts: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Ratlam', 'Chhindwara', 'Katni'],
    zone: 'Central'
  },
  {
    code: 'MH',
    name: 'Maharashtra',
    type: 'STATE',
    center: [19.7515, 75.7139],
    zoom: 6,
    capital: 'Mumbai',
    districts: ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Solapur', 'Amravati', 'Kolhapur', 'Nanded'],
    zone: 'West'
  },
  {
    code: 'MN',
    name: 'Manipur',
    type: 'STATE',
    center: [24.6637, 93.9063],
    zoom: 8,
    capital: 'Imphal',
    districts: ['Imphal West', 'Imphal East', 'Churachandpur', 'Thoubal', 'Bishnupur', 'Senapati', 'Ukhrul', 'Kakching'],
    zone: 'North-East'
  },
  {
    code: 'ML',
    name: 'Meghalaya',
    type: 'STATE',
    center: [25.4670, 91.3662],
    zoom: 8,
    capital: 'Shillong',
    districts: ['East Khasi Hills (Shillong)', 'West Garo Hills (Tura)', 'Ri-Bhoi', 'West Khasi Hills', 'Jaintia Hills', 'South Garo Hills'],
    zone: 'North-East'
  },
  {
    code: 'MZ',
    name: 'Mizoram',
    type: 'STATE',
    center: [23.1645, 92.9376],
    zoom: 8,
    capital: 'Aizawl',
    districts: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip', 'Mamit', 'Lawngtlai', 'Siaha'],
    zone: 'North-East'
  },
  {
    code: 'NL',
    name: 'Nagaland',
    type: 'STATE',
    center: [26.1584, 94.5624],
    zoom: 8,
    capital: 'Kohima',
    districts: ['Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Mon', 'Zunheboto', 'Phek'],
    zone: 'North-East'
  },
  {
    code: 'OD',
    name: 'Odisha',
    type: 'STATE',
    center: [20.9517, 85.0985],
    zoom: 7,
    capital: 'Bhubaneswar',
    districts: ['Khordha (Bhubaneswar)', 'Cuttack', 'Sundargarh (Rourkela)', 'Ganjam (Berhampur)', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Angul', 'Jharsuguda'],
    zone: 'East'
  },
  {
    code: 'PB',
    name: 'Punjab',
    type: 'STATE',
    center: [31.1471, 75.3412],
    zoom: 7,
    capital: 'Chandigarh',
    districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)', 'Hoshiarpur', 'Pathankot', 'Moga', 'Firozpur'],
    zone: 'North'
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    type: 'STATE',
    center: [27.0238, 74.2179],
    zoom: 6,
    capital: 'Jaipur',
    districts: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Barmer'],
    zone: 'North'
  },
  {
    code: 'SK',
    name: 'Sikkim',
    type: 'STATE',
    center: [27.5330, 88.5122],
    zoom: 8,
    capital: 'Gangtok',
    districts: ['Gangtok (East Sikkim)', 'Namchi (South Sikkim)', 'Gyalshing (West Sikkim)', 'Mangan (North Sikkim)', 'Pakyong', 'Soreng'],
    zone: 'North-East'
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    type: 'STATE',
    center: [11.1271, 78.6569],
    zoom: 7,
    capital: 'Chennai',
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Kanchipuram'],
    zone: 'South'
  },
  {
    code: 'TS',
    name: 'Telangana',
    type: 'STATE',
    center: [18.1124, 79.0193],
    zoom: 7,
    capital: 'Hyderabad',
    districts: ['Hyderabad', 'Ranga Reddy', 'Medchal-Malkajgiri', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Mahabubnagar', 'Siddipet'],
    zone: 'South'
  },
  {
    code: 'TR',
    name: 'Tripura',
    type: 'STATE',
    center: [23.9408, 91.9882],
    zoom: 8,
    capital: 'Agartala',
    districts: ['West Tripura (Agartala)', 'Gomati', 'South Tripura', 'Dhalai', 'North Tripura', 'Unakoti', 'Sepahijala', 'Khowai'],
    zone: 'North-East'
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    type: 'STATE',
    center: [26.8467, 80.9462],
    zoom: 6,
    capital: 'Lucknow',
    districts: ['Lucknow', 'Kanpur Nagar', 'Varanasi', 'Prayagraj', 'Agra', 'Meerut', 'Ghaziabad', 'Gautam Buddha Nagar (Noida)', 'Gorakhpur', 'Bareilly', 'Aligarh', 'Moradabad', 'Ayodhya', 'Jhansi', 'Saharanpur'],
    zone: 'North'
  },
  {
    code: 'UK',
    name: 'Uttarakhand',
    type: 'STATE',
    center: [30.0668, 79.0193],
    zoom: 7,
    capital: 'Dehradun',
    districts: ['Dehradun', 'Haridwar', 'Nainital', 'Udham Singh Nagar', 'Rishikesh', 'Pauri Garhwal', 'Almora', 'Tehri Garhwal', 'Chamoli', 'Pithoragarh', 'Uttarkashi'],
    zone: 'North'
  },
  {
    code: 'WB',
    name: 'West Bengal',
    type: 'STATE',
    center: [22.9868, 87.8550],
    zoom: 7,
    capital: 'Kolkata',
    districts: ['Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Hooghly', 'Paschim Medinipur', 'Purba Bardhaman', 'Darjeeling', 'Siliguri', 'Nadia', 'Murshidabad', 'Malda'],
    zone: 'East'
  },

  // --- 8 UNION TERRITORIES ---
  {
    code: 'AN',
    name: 'Andaman & Nicobar Islands',
    type: 'UT',
    center: [11.7401, 92.6586],
    zoom: 7,
    capital: 'Port Blair',
    districts: ['South Andaman (Port Blair)', 'North and Middle Andaman', 'Nicobar'],
    zone: 'Islands'
  },
  {
    code: 'CH',
    name: 'Chandigarh',
    type: 'UT',
    center: [30.7333, 76.7794],
    zoom: 11,
    capital: 'Chandigarh',
    districts: ['Chandigarh Urban', 'Sector 17 Commercial Complex', 'Sector 34 IT Park', 'Manimajra'],
    zone: 'North'
  },
  {
    code: 'DH',
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    type: 'UT',
    center: [20.4283, 72.8397],
    zoom: 9,
    capital: 'Daman',
    districts: ['Daman', 'Diu', 'Dadra & Nagar Haveli (Silvassa)'],
    zone: 'West'
  },
  {
    code: 'DL',
    name: 'Delhi',
    type: 'UT',
    center: [28.7041, 77.1025],
    zoom: 10,
    capital: 'New Delhi',
    districts: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'South West Delhi', 'North West Delhi', 'North East Delhi', 'Shahdara'],
    zone: 'North'
  },
  {
    code: 'JK',
    name: 'Jammu & Kashmir',
    type: 'UT',
    center: [33.7782, 76.5762],
    zoom: 7,
    capital: 'Srinagar / Jammu',
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Pulwama', 'Kupwara', 'Budgam', 'Rajouri'],
    zone: 'North'
  },
  {
    code: 'LA',
    name: 'Ladakh',
    type: 'UT',
    center: [34.1526, 77.5771],
    zoom: 7,
    capital: 'Leh',
    districts: ['Leh', 'Kargil', 'Nubra Valley', 'Zanskar', 'Changthang'],
    zone: 'North'
  },
  {
    code: 'LD',
    name: 'Lakshadweep',
    type: 'UT',
    center: [10.5667, 72.6417],
    zoom: 9,
    capital: 'Kavaratti',
    districts: ['Kavaratti', 'Agatti', 'Andrott', 'Minicoy', 'Amini'],
    zone: 'Islands'
  },
  {
    code: 'PY',
    name: 'Puducherry',
    type: 'UT',
    center: [11.9416, 79.8083],
    zoom: 10,
    capital: 'Puducherry',
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    zone: 'South'
  }
];

export const MINISTRIES_AND_DEPARTMENTS: { ministry: string; departments: string[]; categories: string[] }[] = [
  {
    ministry: 'Ministry of Road Transport and Highways (MoRTH)',
    departments: ['National Highways Authority of India (NHAI)', 'State Public Works Department (PWD) - Highways', 'National Highways & Infrastructure Development Corp (NHIDCL)'],
    categories: ['roads', 'bridges']
  },
  {
    ministry: 'Ministry of Jal Shakti',
    departments: ['National Jal Jeevan Mission (JJM)', 'Central Water Commission (CWC)', 'State Water Resources & Irrigation Department', 'Public Health Engineering Department (PHED)'],
    categories: ['water', 'drainage', 'sanitation']
  },
  {
    ministry: 'Ministry of Health and Family Welfare (MoHFW)',
    departments: ['Pradhan Mantri Swasthya Suraksha Yojana (PMSSY)', 'National Health Mission (NHM)', 'State Health System Resource Centre', 'Central Public Works Department (Health Wing)'],
    categories: ['hospitals', 'rural_infrastructure']
  },
  {
    ministry: 'Ministry of Education',
    departments: ['Samagra Shiksha Abhiyan', 'PM SHRI Schools Cell', 'Higher Education Infrastructure Development Cell', 'Kendriya Vidyalaya Sangathan (KVS) Nirman Cell'],
    categories: ['schools', 'anganwadi']
  },
  {
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    departments: ['Smart Cities Mission Directorate', 'Central Public Works Department (CPWD)', 'Urban Local Bodies & Development Authorities (ULBs)', 'AMRUT 2.0 Mission Cell'],
    categories: ['public_buildings', 'drainage', 'urban_infrastructure', 'street_lighting']
  },
  {
    ministry: 'Ministry of Railways',
    departments: ['Rail Land Development Authority (RLDA)', 'Dedicated Freight Corridor Corp (DFCCIL)', 'State Metro Rail Corporation (JVC)'],
    categories: ['rail_transit', 'rail', 'bridges']
  },
  {
    ministry: 'Ministry of Rural Development & Panchayati Raj',
    departments: ['Pradhan Mantri Gram Sadak Yojana (PMGSY)', 'State Rural Infrastructure Development Agency', 'Gram Panchayat Nidhi Cell', 'National Rural Livelihood Mission (NRLM)'],
    categories: ['rural_infrastructure', 'roads', 'water', 'sanitation', 'street_lighting', 'anganwadi']
  },
  {
    ministry: 'Ministry of Women & Child Development',
    departments: ['Saksham Anganwadi & Poshan 2.0 Mission', 'State ICDS Infrastructure Wing'],
    categories: ['anganwadi', 'schools', 'rural_infrastructure']
  }
];

// Complete Hierarchical District -> Block -> Gram Panchayat -> Village administrative dictionary
export interface VillageHierarchyInfo {
  village: string;
  gramPanchayat: string;
  block: string;
  district: string;
  state: string;
  localityType: 'RURAL' | 'URBAN';
  populationEst: number;
}

export interface BlockHierarchyInfo {
  block: string;
  district: string;
  state: string;
  headquarters: string;
  gramPanchayats: string[];
  villagesMap: Record<string, string[]>; // GP -> Villages
}

export const STATE_ADMIN_HIERARCHIES: Record<string, Record<string, BlockHierarchyInfo[]>> = {
  'Bihar': {
    'Patna': [
      {
        block: 'Barh',
        district: 'Patna',
        state: 'Bihar',
        headquarters: 'Barh Town',
        gramPanchayats: ['Bakhtiyarpur Rural', 'Mokama Dehat', 'Dhanawan', 'Salimpur', 'Rani Sarai'],
        villagesMap: {
          'Bakhtiyarpur Rural': ['Rampur Damodarpur', 'Karnauti', 'Champa Nagar', 'Hasanpur'],
          'Mokama Dehat': ['Aunta', 'Mor', 'Hathidah Buzurg'],
          'Dhanawan': ['Dhanawan Khas', 'Bishunpur', 'Mirzapur'],
          'Salimpur': ['Salimpur Purbi', 'Salimpur Paschimi'],
          'Rani Sarai': ['Sarai Buzurg', 'Babhantoli']
        }
      },
      {
        block: 'Danapur',
        district: 'Patna',
        state: 'Bihar',
        headquarters: 'Danapur Cantt',
        gramPanchayats: ['Khagol Dehat', 'Mustafapur', 'Hetampur', 'Mobarakpur'],
        villagesMap: {
          'Khagol Dehat': ['Kothawan', 'Chitraguptanagar Local', 'Lakhna'],
          'Mustafapur': ['Mustafapur Khas', 'Sultanpur'],
          'Hetampur': ['Hetampur Diara', 'Kasimchak'],
          'Mobarakpur': ['Mobarakpur North', 'Bishunpura']
        }
      },
      {
        block: 'Phulwari Sharif',
        district: 'Patna',
        state: 'Bihar',
        headquarters: 'Phulwari Sharif',
        gramPanchayats: ['Gopalpur', 'Sampatchak Rural', 'Khurji Rural', 'Nohsa'],
        villagesMap: {
          'Gopalpur': ['Gopalpur Diara', 'Rampur Gopalpur'],
          'Sampatchak Rural': ['Sampatchak Main', 'Chhoti Kothiya'],
          'Khurji Rural': ['Digha Ghat Periphery', 'Kurji Basti'],
          'Nohsa': ['Nohsa Tola', 'Alawalpur']
        }
      }
    ],
    'Darbhanga': [
      {
        block: 'Keoti',
        district: 'Darbhanga',
        state: 'Bihar',
        headquarters: 'Keoti Ranway',
        gramPanchayats: ['Shobhan Rural', 'Keoti North', 'Pindaruch', 'Dighiar'],
        villagesMap: {
          'Shobhan Rural': ['Shobhan Bypass Basti', 'Ekmi Gram', 'Kansi'],
          'Keoti North': ['Keoti Khas', 'Khirkha'],
          'Pindaruch': ['Pindaruch Dih', 'Bhatpura'],
          'Dighiar': ['Dighiar Tola', 'Madhupur']
        }
      },
      {
        block: 'Bahadurpur',
        district: 'Darbhanga',
        state: 'Bihar',
        headquarters: 'Bahadurpur',
        gramPanchayats: ['Ugahra', 'Meknaida', 'Kusheshwar Asthan Link', 'Dilawarpur'],
        villagesMap: {
          'Ugahra': ['Ugahra Khas', 'Chhatwan'],
          'Meknaida': ['Meknaida Tola', 'Baur'],
          'Kusheshwar Asthan Link': ['Ber', 'Jahangirpur'],
          'Dilawarpur': ['Dilawarpur Dih', 'Bhalpatti']
        }
      }
    ],
    'Gaya': [
      {
        block: 'Bodh Gaya',
        district: 'Gaya',
        state: 'Bihar',
        headquarters: 'Bodh Gaya',
        gramPanchayats: ['Bakrour', 'Mastipur', 'Mocharim', 'Itwan'],
        villagesMap: {
          'Bakrour': ['Sujata Kuti Gram', 'Dungeshwari Foothills'],
          'Mastipur': ['Mastipur Tola', 'Niranjana Riverside'],
          'Mocharim': ['Mocharim Khas', 'Tirath'],
          'Itwan': ['Itwan Buzurg', 'Belsar']
        }
      }
    ]
  },
  'Uttar Pradesh': {
    'Ghaziabad': [
      {
        block: 'Loni',
        district: 'Ghaziabad',
        state: 'Uttar Pradesh',
        headquarters: 'Loni Border',
        gramPanchayats: ['Nithora', 'Banthla', 'Chirodi', 'Pachayara', 'Mandola'],
        villagesMap: {
          'Nithora': ['Nithora Dehat', 'Sultanpur Loni', 'Mewat Basti'],
          'Banthla': ['Banthla Khas', 'Mustafabad Rural'],
          'Chirodi': ['Chirodi Gram', 'Rampur Loni'],
          'Pachayara': ['Pachayara Dih', 'Saboli Kalan'],
          'Mandola': ['Mandola Vihar Gram', 'Housing Sector Peripheral']
        }
      },
      {
        block: 'Muradnagar',
        district: 'Ghaziabad',
        state: 'Uttar Pradesh',
        headquarters: 'Muradnagar',
        gramPanchayats: ['Asalat Nagar', 'Surana', 'Kusaliya', 'Rawli'],
        villagesMap: {
          'Asalat Nagar': ['Asalat Nagar Khas', 'Jalalpur'],
          'Surana': ['Surana Historical Gram', 'Milak'],
          'Kusaliya': ['Kusaliya Basti', 'Shahpur'],
          'Rawli': ['Rawli Kalan', 'Kalanpur']
        }
      },
      {
        block: 'Razapur',
        district: 'Ghaziabad',
        state: 'Uttar Pradesh',
        headquarters: 'Razapur',
        gramPanchayats: ['Duhai', 'Morta', 'Sadiqpur', 'Shahpur Bamheta'],
        villagesMap: {
          'Duhai': ['Duhai Depot Peripheral', 'Duhai Gram'],
          'Morta': ['Morta Khas', 'Manan Dham Sector'],
          'Sadiqpur': ['Sadiqpur Basti', 'Mehrauli Dehat'],
          'Shahpur Bamheta': ['Bamheta Gram', 'Wave City Link Basti']
        }
      }
    ],
    'Varanasi': [
      {
        block: 'Kashi Vidyapeeth',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        headquarters: 'Vidyapeeth',
        gramPanchayats: ['Shivpur Rural', 'Manduadih Dehat', 'Lahartara Gram', 'Lohta'],
        villagesMap: {
          'Shivpur Rural': ['Shivpur Basti', 'Tarna'],
          'Manduadih Dehat': ['Manduadih South', 'Madhopur'],
          'Lahartara Gram': ['Lahartara Tal', 'Baulia'],
          'Lohta': ['Lohta Weavers Colony', 'Bhikharipur']
        }
      }
    ]
  },
  'Rajasthan': {
    'Dholpur': [
      {
        block: 'Bari',
        district: 'Dholpur',
        state: 'Rajasthan',
        headquarters: 'Bari Town',
        gramPanchayats: ['Kanchanpur', 'Basai Dang', 'Saipau Rural', 'Kherli'],
        villagesMap: {
          'Kanchanpur': ['Kanchanpur Khas', 'Dhamori', 'Kalyanpur'],
          'Basai Dang': ['Basai Dang Ravines', 'Chambal Kinara Basti'],
          'Saipau Rural': ['Saipau Mandi Area', 'Garhi'],
          'Kherli': ['Kherli Buzurg', 'Pipra']
        }
      },
      {
        block: 'Rajakhera',
        district: 'Dholpur',
        state: 'Rajasthan',
        headquarters: 'Rajakhera',
        gramPanchayats: ['Samona', 'Mangrol', 'Nandpur', 'Silawali'],
        villagesMap: {
          'Samona': ['Samona Dih', 'Jalalpur Dholpur'],
          'Mangrol': ['Mangrol Riverfront', 'Chak Samona'],
          'Nandpur': ['Nandpur Khas', 'Bheekhampur'],
          'Silawali': ['Silawali Gram', 'Gadi']
        }
      }
    ]
  },
  'Maharashtra': {
    'Pune': [
      {
        block: 'Haveli',
        district: 'Pune',
        state: 'Maharashtra',
        headquarters: 'Pune Camp',
        gramPanchayats: ['Wagholi Rural', 'Manjari Budruk', 'Uruli Kanchan', 'Khanapur'],
        villagesMap: {
          'Wagholi Rural': ['Bakori Road Basti', 'Wagholi Gavthan', 'Domkhel'],
          'Manjari Budruk': ['Manjari Farm Area', 'Kolwadi Link'],
          'Uruli Kanchan': ['Naturopathy Ashram Gram', 'Koregaon Mul'],
          'Khanapur': ['Khadakwasla Backwaters Basti', 'Malkhed']
        }
      }
    ]
  },
  'Karnataka': {
    'Bengaluru Urban': [
      {
        block: 'Anekal',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        headquarters: 'Anekal',
        gramPanchayats: ['Sarjapura Rural', 'Dommasandra', 'Attibele Rural', 'Chandapura Gram'],
        villagesMap: {
          'Sarjapura Rural': ['Gunjur Palya', 'Chambenahalli', 'Yamare'],
          'Dommasandra': ['Dommasandra Village', 'Kommasandra'],
          'Attibele Rural': ['Mayasandra', 'Indlabele'],
          'Chandapura Gram': ['Surya City Link', 'Kachanayakanahalli']
        }
      }
    ]
  }
};

// Generates synthetic fallback hierarchy for any state/district without manual tables
export function getHierarchyForLocation(stateName: string, districtName: string): BlockHierarchyInfo[] {
  if (STATE_ADMIN_HIERARCHIES[stateName] && STATE_ADMIN_HIERARCHIES[stateName][districtName]) {
    return STATE_ADMIN_HIERARCHIES[stateName][districtName];
  }

  // Synthesize realistic administrative blocks and GPs based on district name
  const baseBlock1 = `${districtName} Sadar`;
  const baseBlock2 = `${districtName} North`;
  const baseBlock3 = `${districtName} Rural`;

  return [
    {
      block: baseBlock1,
      district: districtName,
      state: stateName,
      headquarters: `${districtName} Headquarter`,
      gramPanchayats: [`${districtName} Central GP`, 'Adarsh Gram Panchayat', 'Shanti Nagar GP', 'Kisan Nagar GP'],
      villagesMap: {
        [`${districtName} Central GP`]: [`${districtName} Village-1`, `${districtName} Village-2`],
        'Adarsh Gram Panchayat': ['Adarsh Gram Purva', 'Adarsh Gram Paschim'],
        'Shanti Nagar GP': ['Shanti Tola', 'Bapu Nagar Basti'],
        'Kisan Nagar GP': ['Kisan Mandi Gaon', 'Harit Gram']
      }
    },
    {
      block: baseBlock2,
      district: districtName,
      state: stateName,
      headquarters: `${districtName} Sub-Division`,
      gramPanchayats: ['Kalyanpur GP', 'Govindpur GP', 'Shivpur GP'],
      villagesMap: {
        'Kalyanpur GP': ['Kalyanpur Khas', 'Kalyanpur Purab'],
        'Govindpur GP': ['Govindpur Dih', 'Govindpur Tola'],
        'Shivpur GP': ['Shivpur Mandir Gram', 'Shivpur Talab Basti']
      }
    },
    {
      block: baseBlock3,
      district: districtName,
      state: stateName,
      headquarters: `${districtName} Development Block`,
      gramPanchayats: ['Gram Vikas Panchayat', 'Krishi Vigyan GP', 'Nav Nirman GP'],
      villagesMap: {
        'Gram Vikas Panchayat': ['Vikas Nagar Gaon', 'Pragati Tola'],
        'Krishi Vigyan GP': ['Annadata Gaon', 'Khetipura'],
        'Nav Nirman GP': ['Naya Gaon', 'Udaypur']
      }
    }
  ];
}
