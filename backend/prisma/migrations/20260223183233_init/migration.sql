-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('SCHOOL', 'AL', 'UNI');

-- CreateEnum
CREATE TYPE "Medium" AS ENUM ('SINHALA', 'TAMIL', 'ENGLISH');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "educationLevel" "EducationLevel" NOT NULL,
    "medium" "Medium",
    "subjects" TEXT[],
    "grade" INTEGER,
    "schoolName" TEXT,
    "city" TEXT,
    "stream" TEXT,
    "universityName" TEXT,
    "course" TEXT,
    "yearOfStudy" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT,
    "maxCapacity" INTEGER NOT NULL DEFAULT 10,
    "educationLevel" "EducationLevel" NOT NULL,
    "medium" "Medium",
    "grade" INTEGER,
    "stream" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "focusMinutes" INTEGER NOT NULL DEFAULT 0,
    "pomodorosCompleted" INTEGER NOT NULL DEFAULT 0,
    "subject" TEXT,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "requirement" INTEGER NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId","achievementId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_educationLevel_idx" ON "User"("educationLevel");

-- CreateIndex
CREATE INDEX "User_city_idx" ON "User"("city");

-- CreateIndex
CREATE INDEX "User_universityName_idx" ON "User"("universityName");

-- CreateIndex
CREATE INDEX "Room_subject_idx" ON "Room"("subject");

-- CreateIndex
CREATE INDEX "Room_isPublic_idx" ON "Room"("isPublic");

-- CreateIndex
CREATE INDEX "Room_ownerId_idx" ON "Room"("ownerId");

-- CreateIndex
CREATE INDEX "Room_educationLevel_idx" ON "Room"("educationLevel");

-- CreateIndex
CREATE INDEX "Room_grade_idx" ON "Room"("grade");

-- CreateIndex
CREATE INDEX "StudySession_userId_startTime_idx" ON "StudySession"("userId", "startTime");

-- CreateIndex
CREATE INDEX "StudySession_roomId_idx" ON "StudySession"("roomId");

-- CreateIndex
CREATE INDEX "Message_roomId_createdAt_idx" ON "Message"("roomId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_receiverId_key" ON "Friendship"("requesterId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
