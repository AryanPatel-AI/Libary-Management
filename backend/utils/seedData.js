const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

// Load models
const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Book.deleteMany();
    await Transaction.deleteMany();

    console.log('Data cleared...');

    // Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const memberPassword = await bcrypt.hash('Member@123', salt);

    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@library.com',
        password: adminPassword,
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: memberPassword,
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: memberPassword,
        role: 'user'
      }
    ]);

    console.log('Users seeded...');

    // Books
    let books;
    try {
      books = await Book.create([
        { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', isbn: '9780743273565', totalCopies: 5, availableCopies: 4, image: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg' },
        { title: '1984', author: 'George Orwell', category: 'Dystopian', isbn: '9780451524935', totalCopies: 8, availableCopies: 8, image: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg' },
        { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', isbn: '9780060935467', totalCopies: 6, availableCopies: 6, image: 'https://covers.openlibrary.org/b/isbn/9780060935467-L.jpg' },
        { title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction', isbn: '9780316769488', totalCopies: 4, availableCopies: 3, image: 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg' },
      { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Romance', isbn: '9780141439518', totalCopies: 7, availableCopies: 7, image: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg' },
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', isbn: '9780345339683', totalCopies: 10, availableCopies: 9, image: 'https://covers.openlibrary.org/b/isbn/9780345339683-L.jpg' },
      { title: 'Fahrenheit 451', author: 'Ray Bradbury', category: 'Dystopian', isbn: '9781451673319', totalCopies: 5, availableCopies: 5, image: 'https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg' },
      { title: 'Moby Dick', author: 'Herman Melville', category: 'Adventure', isbn: '9781503280786', totalCopies: 3, availableCopies: 3, image: 'https://covers.openlibrary.org/b/isbn/9781503280786-L.jpg' },
      { title: 'War and Peace', author: 'Leo Tolstoy', category: 'Historical Fiction', isbn: '9781400079988', totalCopies: 2, availableCopies: 2, image: 'https://covers.openlibrary.org/b/isbn/9781400079988-L.jpg' },
      { title: 'The Odyssey', author: 'Homer', category: 'Epic', isbn: '9780140268867', totalCopies: 6, availableCopies: 6, image: 'https://covers.openlibrary.org/b/isbn/9780140268867-L.jpg' },
      
      // Indian Educational Books
      { 
        title: 'NCERT Mathematics Class 10', 
        author: 'NCERT', 
        category: 'Textbook', 
        isbn: '9788174506345', 
        totalCopies: 20, 
        availableCopies: 18, 
        image: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?auto=format&fit=crop&q=80&w=600',
        pdfUrl: 'https://ncert.nic.in/textbook/pdf/jemh101.pdf',
        tags: ['Math', 'NCERT', 'Class 10', 'Board Exams']
      },
      { 
        title: 'Concepts of Physics (Vol 1 & 2)', 
        author: 'H.C. Verma', 
        category: 'Physics', 
        isbn: '9788177091878', 
        totalCopies: 15, 
        availableCopies: 10, 
        image: 'https://images.unsplash.com/photo-1636466497217-26c8c27dc00a?auto=format&fit=crop&q=80&w=600',
        tags: ['Physics', 'JEE', 'Advanced', 'Science']
      },
      { 
        title: 'Indian Polity - For Civil Services', 
        author: 'M. Laxmikanth', 
        category: 'Civics', 
        isbn: '9789352603633', 
        totalCopies: 12, 
        availableCopies: 5, 
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
        tags: ['UPSC', 'Polity', 'Government', 'Civics']
      },
      { 
        title: 'Quantitative Aptitude', 
        author: 'R.S. Aggarwal', 
        category: 'Mathematics', 
        isbn: '9789352535323', 
        totalCopies: 25, 
        availableCopies: 22, 
        image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=600',
        tags: ['Aptitude', 'Competitive Exams', 'Math']
      },
      { 
        title: 'A Brief History of Modern India', 
        author: 'Rajiv Ahir (Spectrum)', 
        category: 'History', 
        isbn: '9788179307212', 
        totalCopies: 10, 
        availableCopies: 8, 
        image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600',
        tags: ['History', 'UPSC', 'Modern India']
      },
      { 
        title: 'NCERT Science Class 10', 
        author: 'NCERT', 
        category: 'Textbook', 
        isbn: '9788174506444', 
        totalCopies: 25, 
        availableCopies: 20, 
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
        pdfUrl: 'https://ncert.nic.in/textbook/pdf/jesc101.pdf',
        tags: ['Science', 'NCERT', 'Class 10']
      },
      // B.Tech AI Subjects
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell & Peter Norvig',
        category: 'Artificial Intelligence',
        isbn: '9780136042594',
        totalCopies: 10,
        availableCopies: 8,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600',
        pdfUrl: 'https://zoo.cs.yale.edu/classes/cs470/materials/aima.pdf',
        tags: ['B.Tech AI', 'Core', 'Intelligence']
      },
      {
        title: 'Machine Learning Yearning',
        author: 'Andrew Ng',
        category: 'Machine Learning',
        isbn: '9780134610993',
        totalCopies: 15,
        availableCopies: 12,
        image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600',
        pdfUrl: 'https://p.migdal.pl/machine-learning-yearning.pdf',
        tags: ['B.Tech AI', 'ML', 'Andrew Ng']
      },
      {
        title: 'Deep Learning',
        author: 'Ian Goodfellow',
        category: 'Neural Networks',
        isbn: '9780262035613',
        totalCopies: 5,
        availableCopies: 3,
        image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600',
        pdfUrl: 'https://www.deeplearningbook.org/contents/intro.html',
        tags: ['B.Tech AI', 'Deep Learning', 'Neural Networks']
      },
      {
        title: 'Python for Data Analysis',
        author: 'Wes McKinney',
        category: 'Data Science',
        isbn: '9781449319793',
        totalCopies: 20,
        availableCopies: 15,
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
        pdfUrl: 'https://wesmckinney.com/book/',
        tags: ['B.Tech AI', 'Python', 'Data Analysis']
      },
      {
        title: 'Natural Language Processing',
        author: 'Jacob Eisenstein',
        category: 'NLP',
        isbn: '9780262042840',
        totalCopies: 8,
        availableCopies: 6,
        image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600',
        pdfUrl: 'https://github.com/jacobeisenstein/gt-nlp-class/blob/master/notes/notes.pdf',
        tags: ['B.Tech AI', 'NLP', 'Language']
      }
    ]);
      console.log('Books seeded...');
    } catch (error) {
      console.error('Error seeding books:', error.message);
      throw error; // Re-throw to stop seeding
    }

    // Transactions
    await Transaction.create([
      {
        user: users[1]._id,
        book: books[0]._id, // The Great Gatsby
        issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        status: 'issued'
      },
      {
        user: users[2]._id,
        book: books[3]._id, // Catcher in the Rye
        issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Due 1 day ago (Late)
        status: 'issued'
      },
      {
        user: users[1]._id,
        book: books[5]._id, // The Hobbit
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'issued'
      }
    ]);

    console.log('Transactions seeded...');
    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
