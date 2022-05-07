const N = 10000;

for (let i in N) {
    const dateOld = Date.now();
    async () => {
     /*   let deptNo = document.getElementById("deptNo").value;
        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let hireDate = document.getElementById("hireDate").value;
        let salary = document.getElementById("salary").value;
    
        let http = new XMLHttpRequest();
        http.open("POST", `../employees`, false);
        http.setRequestHeader("Content-Type", "application/json");
        http.send(JSON.stringify({
            deptNo: deptNo,
            firstName: firstName,
            lastName: lastName,
            hireDate: hireDate,
            salary: salary
        }));*/
    
        //let response = JSON.parse(http.responseText);
        console.log(`${Date.now() - dateOld}: ${http.responseText}`);
    }
}