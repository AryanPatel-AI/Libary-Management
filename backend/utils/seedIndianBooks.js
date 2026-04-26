const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const indianBooks = [
  {
    title: "Higher Engineering Mathematics",
    author: "B.S. Grewal",
    category: "Engineering",
    isbn: "978-81-933284-9-1",
    description: "Standard textbook for engineering mathematics in Indian universities.",
    publisher: "Khanna Publishers",
    publishedYear: 2021,
    totalCopies: 15,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  },
  {
    title: "Data Structures and Algorithms Made Easy",
    author: "Narasimha Karumanchi",
    category: "Computer Science",
    isbn: "978-81-921075-9-2",
    description: "Best-selling DSA book for Indian engineering students and interview prep.",
    publisher: "CareerMonk Publications",
    publishedYear: 2020,
    totalCopies: 20,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600",
    isPaid: true,
    price: 499
  },
  {
    title: "Human Anatomy (Regional and Applied)",
    author: "B.D. Chaurasia",
    category: "Medical",
    isbn: "978-81-239-2330-7",
    description: "The bible of Anatomy for MBBS students in India.",
    publisher: "CBS Publishers",
    publishedYear: 2019,
    totalCopies: 10,
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  },
  {
    title: "Advanced Accountancy Vol. 1",
    author: "M.C. Shukla & T.S. Grewal",
    category: "Commerce",
    isbn: "978-81-219-0278-6",
    description: "Essential for CA Foundation and B.Com students.",
    publisher: "S. Chand Publishing",
    publishedYear: 2022,
    totalCopies: 12,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  },
  {
    title: "The C Programming Language",
    author: "Kernighan & Ritchie",
    category: "Computer Science",
    isbn: "978-0131103627",
    description: "The definitive guide to C programming, widely used in Indian curriculum.",
    publisher: "Pearson Education",
    publishedYear: 1988,
    totalCopies: 25,
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=600",
    isPaid: false
  },
  {
    title: "Principles of Marketing",
    author: "Philip Kotler",
    category: "Management",
    isbn: "978-0134492513",
    description: "Standard marketing textbook for MBA students worldwide, including India.",
    publisher: "Pearson",
    publishedYear: 2017,
    totalCopies: 8,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    isPaid: true,
    price: 899
  }
];

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Filter out existing ISBNs
    const existingIsbns = await Book.find({ isbn: { $in: indianBooks.map(b => b.isbn) } }).distinct('isbn');
    const newBooks = indianBooks.filter(b => !existingIsbns.includes(b.isbn));

    if (newBooks.length > 0) {
      await Book.insertMany(newBooks);
      console.log(`${newBooks.length} Indian college books added successfully!`);
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
