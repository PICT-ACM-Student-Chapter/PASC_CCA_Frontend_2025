export interface UserAttendanceStats{
    sessionsAttended : number;
    sessions: AttendanceSession[];
    totalCredits: number;
    completionRate : number;
    userPersonalBest : UserPersonalBest;
  }

  export interface AttendanceSession {
    id?: number;
    eventId: number;
    startTime?: String ;
    endTime?: String;
    isActive: boolean;
    sessionName: string;
    code: string;
    location:string; 
    credits : number;
  }

  
export interface UserPersonalBest{
  sessionId: number;
  userId : number;
  credits : number;
}