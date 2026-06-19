
export function LoginUserCheck(checkEmail:string){
    const Email: string[]=[
        "person1@gmail.com",
        "person2@gmail.com",
        "person3@gmail.com",
        "person4@gmail.com",
        "person5@gmail.com"
    ]

    console.log("Email Login Check");
    console.log(Email.includes(checkEmail));

    return Email.includes(checkEmail);
}
