// configuration for form validation: array for each field will contain the validation that field will go through
const validationConfig = {
    "name": ["present"],
    "email": ["present", "emailFormat"],
    "date": ["present"],
    "doctor": ["present"],
    "slot": ["present"],
    "purpose": [],
}

// doctor list
const docs = [
  "Aarya Sharma",
  "Rohan Mehta",
  "Meera Nair",
  "Vihaan Kapoor",
  "Kavya Sinha",
  "Arjun Patel",
  "Isha Reddy",
  "Dev Malhotra",
  "Ananya Iyer",
  "Neil Deshmukh",
  "Tara Joshi",
  "Kunal Bansal",
  "Riya Choudhury",
  "Yash Verma",
  "Sneha Bhatt",
  "Aryan Singh",
  "Pooja Das",
  "Rahul Jain",
  "Nikita Roy",
  "Aditya Chauhan"
];

// global variables
const slots = ["10:00", "11:00", "12:00", "1:00"];

export { validationConfig, docs, slots };