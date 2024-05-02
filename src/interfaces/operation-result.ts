import { ApiProperty } from "@nestjs/swagger";

export class OperationResult<T> {

    @ApiProperty()
    isValid: boolean;
    /* exceptions: {
        code: string;
        description: string;
    }[]; */
    @ApiProperty()
    exceptions: OperationException[];
    @ApiProperty()
    content: T[];
}

class OperationException{
    @ApiProperty()
    code: string;
    @ApiProperty()
    description: string;
}