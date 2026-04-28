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
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@library.com',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Member@123',
        role: 'user',
        isVerified: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Member@123',
        role: 'user',
        isVerified: true
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
      },
      // Business & Finance
      {
        title: 'The Intelligent Investor',
        author: 'Benjamin Graham',
        category: 'Finance',
        isbn: '9780060555665',
        totalCopies: 10,
        availableCopies: 10,
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600',
        tags: ['Investing', 'Stocks', 'Finance']
      },
      {
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        category: 'Finance',
        isbn: '9781612680194',
        totalCopies: 15,
        availableCopies: 15,
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=600',
        tags: ['Finance', 'Self-Help', 'Money']
      },
      {
        title: 'Zero to One',
        author: 'Peter Thiel',
        category: 'Management',
        isbn: '9780804139298',
        totalCopies: 12,
        availableCopies: 12,
        image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600',
        tags: ['Startup', 'Business', 'Management']
      },
      // Medical
      {
        title: 'Gray\'s Anatomy',
        author: 'Henry Gray',
        category: 'Medical',
        isbn: '9780443066764',
        totalCopies: 5,
        availableCopies: 5,
        image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=600',
        tags: ['Medical', 'Anatomy', 'Reference']
      },
      {
        title: 'Harrison\'s Principles of Internal Medicine',
        author: 'Anthony Fauci et al.',
        category: 'Medical',
        isbn: '9781259640032',
        totalCopies: 3,
        availableCopies: 3,
        image: 'https://images.unsplash.com/photo-1576091160550-2173bdd99602?auto=format&fit=crop&q=80&w=600',
        tags: ['Medical', 'Internal Medicine', 'Advanced']
      },
      // Engineering
      {
        title: 'Design of Machine Elements',
        author: 'V.B. Bhandari',
        category: 'Engineering',
        isbn: '9780070681798',
        totalCopies: 10,
        availableCopies: 10,
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600',
        tags: ['Mechanical', 'Design', 'B.Tech']
      },
      {
        title: 'Signals and Systems',
        author: 'Alan V. Oppenheim',
        category: 'Engineering',
        isbn: '9780138147570',
        totalCopies: 8,
        availableCopies: 8,
        image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=600',
        tags: ['Electronics', 'Signals', 'Academic']
      },
      // Law & Civics
      {
        title: 'The Constitution of India',
        author: 'P.M. Bakshi',
        category: 'Civics',
        isbn: '9788175349407',
        totalCopies: 20,
        availableCopies: 20,
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
        tags: ['Law', 'Constitution', 'India']
      },
      // Self Help
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Self Help',
        isbn: '9780735211292',
        totalCopies: 30,
        availableCopies: 28,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
        tags: ['Habits', 'Productivity', 'Self-Help']
      },
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        category: 'Science (B.Sc.)',
        isbn: '9780374275631',
        totalCopies: 10,
        availableCopies: 10,
        image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=600',
        tags: ['Psychology', 'Economics', 'Behavioral Science']
      },
      // Literature
      {
        title: 'One Hundred Years of Solitude',
        author: 'Gabriel García Márquez',
        category: 'Fiction',
        isbn: '9780060883287',
        totalCopies: 5,
        availableCopies: 5,
        image: 'https://images.unsplash.com/photo-1474932430478-3a7fb0500e3f?auto=format&fit=crop&q=80&w=600',
        tags: ['Literature', 'Classic', 'Magic Realism']
      },
      {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        category: 'Fiction',
        isbn: '9780062315007',
        totalCopies: 20,
        availableCopies: 20,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
        tags: ['Inspiration', 'Classic', 'Adventure']
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
