const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise LMS Database Seeding...');

  // 1. Clear existing seed data gracefully (in reverse dependency order)
  console.log('🧹 Cleaning old records...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.finePayment.deleteMany();
  await prisma.fine.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.inventorySession.deleteMany();
  await prisma.bookCopy.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.bookCategory.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.circulationPolicy.deleteMany();
  await prisma.member.deleteMany();
  await prisma.memberType.deleteMany();
  await prisma.locationShelf.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Permissions
  console.log('🔐 Seeding Permissions...');
  const permissionsList = [
    // Catalog
    { code: 'catalog:book:create', category: 'Catalog', description: 'Create new bibliographic records' },
    { code: 'catalog:book:update', category: 'Catalog', description: 'Update existing bibliographic records' },
    { code: 'catalog:book:delete', category: 'Catalog', description: 'Delete bibliographic records' },
    { code: 'catalog:book:view', category: 'Catalog', description: 'View public and private catalog' },
    // Inventory / Copies
    { code: 'inventory:copy:create', category: 'Inventory', description: 'Create physical copy with barcode' },
    { code: 'inventory:copy:update', category: 'Inventory', description: 'Update physical copy details' },
    { code: 'inventory:copy:status', category: 'Inventory', description: 'Change physical copy status' },
    // Circulation
    { code: 'circulation:loan:issue', category: 'Circulation', description: 'Issue book loan at desk' },
    { code: 'circulation:loan:return', category: 'Circulation', description: 'Process book return checkin' },
    { code: 'circulation:loan:renew', category: 'Circulation', description: 'Renew active loans' },
    // Reservations
    { code: 'reservation:create', category: 'Reservations', description: 'Place hold on unavailable books' },
    { code: 'reservation:cancel', category: 'Reservations', description: 'Cancel active reservations' },
    { code: 'reservation:fulfill', category: 'Reservations', description: 'Process hold pickup at desk' },
    // Fines
    { code: 'fines:assess', category: 'Fines', description: 'Manually assess damage or lost book fines' },
    { code: 'fines:payment:create', category: 'Fines', description: 'Collect fine payments' },
    { code: 'fines:waive', category: 'Fines', description: 'Waive fines with audit reason' },
    // Members
    { code: 'members:register', category: 'Members', description: 'Register new library members' },
    { code: 'members:update', category: 'Members', description: 'Update member profile and cards' },
    { code: 'members:suspend', category: 'Members', description: 'Suspend or bar library members' },
    // Inventory Audits
    { code: 'inventory:audit:manage', category: 'Inventory', description: 'Create and reconcile stock audit sessions' },
    { code: 'inventory:audit:scan', category: 'Inventory', description: 'Scan items during stock verification' },
    // Reports & Logs
    { code: 'reports:view', category: 'Reports', description: 'View analytics and circulation reports' },
    { code: 'reports:export', category: 'Reports', description: 'Export reports as CSV or PDF' },
    { code: 'audit:view', category: 'Audit', description: 'Inspect immutable system audit logs' },
    { code: 'settings:manage', category: 'Settings', description: 'Manage global and branch settings' }
  ];

  const permissions = {};
  for (const p of permissionsList) {
    permissions[p.code] = await prisma.permission.create({ data: p });
  }

  // 3. Seed Roles
  console.log('🛡️ Seeding Roles...');
  const rolesData = [
    { name: 'SUPER_ADMIN', description: 'Full system control and configuration', isSystemRole: true },
    { name: 'LIBRARIAN', description: 'Chief Branch Librarian with operational control', isSystemRole: true },
    { name: 'CIRCULATION_STAFF', description: 'Desk assistant processing checkout/checkin', isSystemRole: true },
    { name: 'MEMBER', description: 'Patron/Student using catalog, loans, and holds', isSystemRole: true },
    { name: 'AUDITOR', description: 'Compliance officer reviewing audits and financials', isSystemRole: true }
  ];

  const roles = {};
  for (const r of rolesData) {
    roles[r.name] = await prisma.role.create({ data: r });
  }

  // Assign Permissions to Roles
  // SUPER_ADMIN gets all
  for (const perm of Object.values(permissions)) {
    await prisma.rolePermission.create({
      data: { roleId: roles.SUPER_ADMIN.id, permissionId: perm.id }
    });
  }

  // LIBRARIAN gets all except settings:manage & book:delete
  const librarianPermCodes = Object.keys(permissions).filter(c => c !== 'catalog:book:delete' && c !== 'settings:manage');
  for (const code of librarianPermCodes) {
    await prisma.rolePermission.create({
      data: { roleId: roles.LIBRARIAN.id, permissionId: permissions[code].id }
    });
  }

  // CIRCULATION_STAFF gets desk operations
  const staffPermCodes = [
    'catalog:book:view', 'inventory:copy:status', 'circulation:loan:issue',
    'circulation:loan:return', 'circulation:loan:renew', 'reservation:create',
    'reservation:cancel', 'reservation:fulfill', 'fines:assess', 'fines:payment:create',
    'members:register', 'members:update', 'inventory:audit:scan'
  ];
  for (const code of staffPermCodes) {
    await prisma.rolePermission.create({
      data: { roleId: roles.CIRCULATION_STAFF.id, permissionId: permissions[code].id }
    });
  }

  // MEMBER gets self actions
  const memberPermCodes = [
    'catalog:book:view', 'circulation:loan:renew', 'reservation:create',
    'reservation:cancel', 'fines:payment:create'
  ];
  for (const code of memberPermCodes) {
    await prisma.rolePermission.create({
      data: { roleId: roles.MEMBER.id, permissionId: permissions[code].id }
    });
  }

  // AUDITOR gets reports and audit logs
  const auditorPermCodes = ['catalog:book:view', 'reports:view', 'reports:export', 'audit:view'];
  for (const code of auditorPermCodes) {
    await prisma.rolePermission.create({
      data: { roleId: roles.AUDITOR.id, permissionId: permissions[code].id }
    });
  }

  // 4. Seed Branches
  console.log('🏛️ Seeding Branches...');
  const mainBranch = await prisma.branch.create({
    data: {
      code: 'MAIN-01',
      name: 'Downtown Central Library',
      address: '100 University Avenue',
      city: 'Metropolis',
      state: 'NY',
      phone: '+1 (555) 019-2831',
      email: 'central@library.org'
    }
  });

  const techBranch = await prisma.branch.create({
    data: {
      code: 'TECH-02',
      name: 'Science & Technology Branch',
      address: '450 Innovation Parkway',
      city: 'Metropolis',
      state: 'NY',
      phone: '+1 (555) 019-4820',
      email: 'techbranch@library.org'
    }
  });

  // 5. Seed Shelves
  console.log('📚 Seeding Shelves...');
  const shelfCS101 = await prisma.locationShelf.create({
    data: {
      branchId: mainBranch.id,
      floor: '1',
      room: '101',
      aisle: 'A',
      shelfCode: 'CS-101',
      capacity: 60
    }
  });

  const shelfCS102 = await prisma.locationShelf.create({
    data: {
      branchId: mainBranch.id,
      floor: '1',
      room: '101',
      aisle: 'A',
      shelfCode: 'CS-102',
      capacity: 60
    }
  });

  // 6. Seed Member Types & Circulation Policies
  console.log('📋 Seeding Member Types & Policies...');
  const studentType = await prisma.memberType.create({
    data: {
      name: 'STUDENT',
      maxBorrowLimit: 5,
      defaultLoanPeriodDays: 14,
      finePerDayCents: 100, // $1.00 / day
      maxFineCapCents: 5000, // $50.00 max
      maxRenewals: 2,
      gracePeriodDays: 1,
      membershipDurationDays: 365
    }
  });

  const facultyType = await prisma.memberType.create({
    data: {
      name: 'FACULTY',
      maxBorrowLimit: 15,
      defaultLoanPeriodDays: 60,
      finePerDayCents: 50, // $0.50 / day
      maxFineCapCents: 2000,
      maxRenewals: 5,
      gracePeriodDays: 3,
      membershipDurationDays: 730
    }
  });

  await prisma.circulationPolicy.create({
    data: {
      branchId: null, // Global default
      memberTypeId: studentType.id,
      loanPeriodDays: 14,
      maxLoans: 5,
      finePerDayCents: 100,
      maxFineCents: 5000,
      maxRenewals: 2,
      gracePeriodDays: 1
    }
  });

  await prisma.circulationPolicy.create({
    data: {
      branchId: null, // Global default
      memberTypeId: facultyType.id,
      loanPeriodDays: 60,
      maxLoans: 15,
      finePerDayCents: 50,
      maxFineCents: 2000,
      maxRenewals: 5,
      gracePeriodDays: 3
    }
  });

  // 7. Seed Core Users
  console.log('👥 Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  const defaultHash = await bcrypt.hash('Admin@123', salt);
  const studentHash = await bcrypt.hash('Student@123', salt);
  const staffHash = await bcrypt.hash('Staff@123', salt);
  const librarianHash = await bcrypt.hash('Librarian@123', salt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@library.com',
      passwordHash: defaultHash,
      firstName: 'System',
      lastName: 'Administrator',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });
  await prisma.userRole.create({ data: { userId: adminUser.id, roleId: roles.SUPER_ADMIN.id } });

  const librarianUser = await prisma.user.create({
    data: {
      email: 'librarian@library.com',
      passwordHash: librarianHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });
  await prisma.userRole.create({ data: { userId: librarianUser.id, roleId: roles.LIBRARIAN.id } });

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@library.com',
      passwordHash: staffHash,
      firstName: 'Marcus',
      lastName: 'Vance',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });
  await prisma.userRole.create({ data: { userId: staffUser.id, roleId: roles.CIRCULATION_STAFF.id } });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@library.com',
      passwordHash: studentHash,
      firstName: 'Aryan',
      lastName: 'Patel',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });
  await prisma.userRole.create({ data: { userId: studentUser.id, roleId: roles.MEMBER.id } });

  // Create Member Profile for Student
  const studentMember = await prisma.member.create({
    data: {
      userId: studentUser.id,
      memberNumber: 'MEM-2026-0001',
      memberTypeId: studentType.id,
      homeBranchId: mainBranch.id,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  });

  // 8. Seed Authors, Publishers & Categories
  console.log('🏷️ Seeding Catalog metadata...');
  const oreilly = await prisma.publisher.create({
    data: { name: "O'Reilly Media", website: 'https://oreilly.com', contactEmail: 'info@oreilly.com' }
  });
  const prentice = await prisma.publisher.create({
    data: { name: 'Prentice Hall', website: 'https://pearson.com', contactEmail: 'contact@pearson.com' }
  });
  const mitPress = await prisma.publisher.create({
    data: { name: 'MIT Press', website: 'https://mitpress.mit.edu', contactEmail: 'books@mit.edu' }
  });

  const authorUncleBob = await prisma.author.create({
    data: {
      name: 'Robert C. Martin',
      biography: 'Software craftsman, co-author of the Agile Manifesto, and author of Clean Code.'
    }
  });
  const authorKleppmann = await prisma.author.create({
    data: {
      name: 'Martin Kleppmann',
      biography: 'Researcher in distributed systems at the University of Cambridge.'
    }
  });
  const authorCormen = await prisma.author.create({
    data: {
      name: 'Thomas H. Cormen',
      biography: 'Professor of Computer Science Emeritus at Dartmouth College.'
    }
  });

  const catCS = await prisma.category.create({
    data: { name: 'Computer Science', slug: 'computer-science', description: 'Core computing concepts and engineering' }
  });
  const catSoftwareEng = await prisma.category.create({
    data: { name: 'Software Engineering', slug: 'software-engineering', parentId: catCS.id }
  });
  const catDatabases = await prisma.category.create({
    data: { name: 'Distributed Systems & Databases', slug: 'databases', parentId: catCS.id }
  });
  const catAlgorithms = await prisma.category.create({
    data: { name: 'Data Structures & Algorithms', slug: 'algorithms', parentId: catCS.id }
  });

  // 9. Seed Bibliographic Books
  console.log('📖 Seeding Bibliographic Books...');
  const bookCleanCode = await prisma.book.create({
    data: {
      isbn10: '0132350882',
      isbn13: '9780132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      subtitle: 'A Handbook of Agile Software Craftsmanship',
      description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
      language: 'English',
      edition: '1st Edition',
      publicationYear: 2008,
      publisherId: prentice.id,
      pages: 464,
      coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      digitalPdfUrl: '',
      isPaid: false,
      priceCents: 3999,
      rating: 4.8,
      numReviews: 120
    }
  });
  await prisma.bookAuthor.create({ data: { bookId: bookCleanCode.id, authorId: authorUncleBob.id, authorOrder: 1 } });
  await prisma.bookCategory.create({ data: { bookId: bookCleanCode.id, categoryId: catSoftwareEng.id } });

  const bookDDIA = await prisma.book.create({
    data: {
      isbn10: '1449373321',
      isbn13: '9781449373320',
      title: 'Designing Data-Intensive Applications',
      subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
      description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, and maintainability.',
      language: 'English',
      edition: '1st Edition',
      publicationYear: 2017,
      publisherId: oreilly.id,
      pages: 616,
      coverImageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600',
      digitalPdfUrl: '',
      isPaid: false,
      priceCents: 4999,
      rating: 4.9,
      numReviews: 240
    }
  });
  await prisma.bookAuthor.create({ data: { bookId: bookDDIA.id, authorId: authorKleppmann.id, authorOrder: 1 } });
  await prisma.bookCategory.create({ data: { bookId: bookDDIA.id, categoryId: catDatabases.id } });

  const bookAlgorithms = await prisma.book.create({
    data: {
      isbn10: '026204630X',
      isbn13: '9780262046305',
      title: 'Introduction to Algorithms',
      subtitle: 'Fourth Edition',
      description: 'A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and other topics.',
      language: 'English',
      edition: '4th Edition',
      publicationYear: 2022,
      publisherId: mitPress.id,
      pages: 1312,
      coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
      digitalPdfUrl: '',
      isPaid: false,
      priceCents: 8500,
      rating: 4.7,
      numReviews: 95
    }
  });
  await prisma.bookAuthor.create({ data: { bookId: bookAlgorithms.id, authorId: authorCormen.id, authorOrder: 1 } });
  await prisma.bookCategory.create({ data: { bookId: bookAlgorithms.id, categoryId: catAlgorithms.id } });

  // 10. Seed Physical Copies with Barcodes & Shelves
  console.log('🏷️ Seeding Physical Book Copies...');
  const copiesData = [
    // Clean Code Copies (3 copies)
    { bookId: bookCleanCode.id, barcode: 'LIB-2026-MAIN-001001', accessionNumber: 'ACC-001001', branchId: mainBranch.id, shelfId: shelfCS101.id, status: 'AVAILABLE', condition: 'GOOD', priceCents: 3999 },
    { bookId: bookCleanCode.id, barcode: 'LIB-2026-MAIN-001002', accessionNumber: 'ACC-001002', branchId: mainBranch.id, shelfId: shelfCS101.id, status: 'AVAILABLE', condition: 'EXCELLENT', priceCents: 3999 },
    { bookId: bookCleanCode.id, barcode: 'LIB-2026-MAIN-001003', accessionNumber: 'ACC-001003', branchId: mainBranch.id, shelfId: shelfCS101.id, status: 'AVAILABLE', condition: 'GOOD', priceCents: 3999 },
    // DDIA Copies (2 copies)
    { bookId: bookDDIA.id, barcode: 'LIB-2026-MAIN-002001', accessionNumber: 'ACC-002001', branchId: mainBranch.id, shelfId: shelfCS102.id, status: 'AVAILABLE', condition: 'NEW', priceCents: 4999 },
    { bookId: bookDDIA.id, barcode: 'LIB-2026-MAIN-002002', accessionNumber: 'ACC-002002', branchId: mainBranch.id, shelfId: shelfCS102.id, status: 'AVAILABLE', condition: 'GOOD', priceCents: 4999 },
    // Algorithms Copy (1 copy)
    { bookId: bookAlgorithms.id, barcode: 'LIB-2026-MAIN-003001', accessionNumber: 'ACC-003001', branchId: mainBranch.id, shelfId: shelfCS102.id, status: 'AVAILABLE', condition: 'EXCELLENT', priceCents: 8500 }
  ];

  for (const c of copiesData) {
    await prisma.bookCopy.create({ data: c });
  }

  // 11. Record Initial System Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      entityType: 'SYSTEM',
      entityId: 'SEED_INITIALIZATION',
      action: 'SYSTEM_INITIALIZED',
      beforeState: {},
      afterState: {
        branches: 2,
        books: 3,
        copies: 6,
        permissions: permissionsList.length,
        roles: rolesData.length
      },
      ipAddress: '127.0.0.1',
      userAgent: 'LMS Seed Worker v1.0'
    }
  });

  console.log('✅ Enterprise LMS Database seeding completed successfully!');
  console.log('\nDefault credentials:');
  console.log('  👑 Admin:     admin@library.com     / Admin@123');
  console.log('  📚 Librarian: librarian@library.com / Librarian@123');
  console.log('  🏷️ Staff:     staff@library.com     / Staff@123');
  console.log('  🎓 Student:   student@library.com   / Student@123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
