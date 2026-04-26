const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const govtGradBooks = [
  {
    title: "Indian Polity",
    author: "M. Laxmikanth",
    category: "Govt Exams",
    isbn: "978-93-89538-47-2",
    description: "The most recommended book for UPSC and state PSC exams on Indian Constitution and Polity.",
    publisher: "McGraw Hill",
    publishedYear: 2023,
    totalCopies: 25,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
    isPaid: true,
    price: 650
  },
  {
    title: "Quantitative Aptitude for Competitive Examinations",
    author: "R.S. Aggarwal",
    category: "Govt Exams",
    isbn: "978-93-5253-402-9",
    description: "Essential guide for SSC, Banking, and other competitive exams in India.",
    publisher: "S. Chand Publishing",
    publishedYear: 2022,
    totalCopies: 40,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  },
  {
    title: "A Brief History of Modern India",
    author: "Spectrum Editorial Board",
    category: "Govt Exams",
    isbn: "978-81-7930-745-6",
    description: "Highly popular book for UPSC History preparation.",
    publisher: "Spectrum Books",
    publishedYear: 2021,
    totalCopies: 30,
    image: "https://images.unsplash.com/photo-1461360227054-66ba3f1efdf4?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  },
  {
    title: "Organic Chemistry",
    author: "Morrison & Boyd",
    category: "Science (B.Sc.)",
    isbn: "978-0136436690",
    description: "Classic textbook for Organic Chemistry, widely used in B.Sc. and M.Sc. courses.",
    publisher: "Pearson",
    publishedYear: 2010,
    totalCopies: 15,
    image: "https://images.unsplash.com/photo-1532187875605-7fe3d2519274?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  },
  {
    title: "Macroeconomics: Theory and Policy",
    author: "H.L. Ahuja",
    category: "Arts (B.A.)",
    isbn: "978-93-5253-125-7",
    description: "Standard reference for Economics students in Indian universities.",
    publisher: "S. Chand Publishing",
    publishedYear: 2020,
    totalCopies: 20,
    image: "https://images.unsplash.com/photo-1611974717483-582807c6fb46?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  },
  {
    title: "Concepts of Physics Vol. 1",
    author: "H.C. Verma",
    category: "Science (B.Sc.)",
    isbn: "978-81-7709-187-8",
    description: "Foundational physics book for Indian students, used in B.Sc. and JEE preparation.",
    publisher: "Bharati Bhawan",
    publishedYear: 2018,
    totalCopies: 50,
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  },
  {
    title: "Introduction to Psychology",
    author: "Morgan & King",
    category: "Arts (B.A.)",
    isbn: "978-0070430242",
    description: "Comprehensive introduction to Psychology, a core subject for B.A. students.",
    publisher: "McGraw Hill",
    publishedYear: 2001,
    totalCopies: 12,
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  }
];

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding Govt/Grad books...');

    const existingIsbns = await Book.find({ isbn: { $in: govtGradBooks.map(b => b.isbn) } }).distinct('isbn');
    const newBooks = govtGradBooks.filter(b => !existingIsbns.includes(b.isbn));

    if (newBooks.length > 0) {
      await Book.insertMany(newBooks);
      console.log(`${newBooks.length} Govt Exam & Graduation books added successfully!`);
    } else {
      console.log('All books already exist in the database.');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
};

seedBooks();
