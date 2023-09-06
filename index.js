// imported dependents
const inquirer = require("inquirer");
const mysql = require("mysql2");
// connection between code and mysql
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "employees_db",
});
// function using inquirer to prompt a user to add infromation to a database in mysql
function promptQuestions() {
  inquirer
    .prompt({
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Update an employee's manager",
        "View employees by manager",
        "View employees by department",
        "Delete a department",
        "Delete a role",
        "Delete an employee",
      ],
      loop: true,
      name: "intro",
    })
    .then(function (data) {
      // if statement for viewing all departments
      if (data.intro == "View all departments") {
        db.query(`SELECT * FROM department`, (err, result) => {
          if (err) {
            console.log(err);
          }
          console.table(result);
          promptQuestions();
        });
        // if statement for viewing all roles
      } else if (data.intro == "View all roles") {
        db.query(
          `SELECT role.id AS id, 
          title, 
          salary, 
          department.name AS department 
          FROM role 
          JOIN department 
          ON role.department_id = department.id`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.table(result);
            promptQuestions();
          }
        );
        // if statement for viewing all employees
      } else if (data.intro == "View all employees") {
        db.query(
          `SELECT 
          employee.id AS id, 
          employee.first_name AS first_name, 
          employee.last_name AS last_name, 
          role.title AS title,
          department.name AS department,
          role.salary AS salary,
          CONCAT(manager.first_name,' ',manager.last_name) AS manager
          FROM employee 
          JOIN role 
          ON employee.role_id = role.id 
          JOIN department 
          ON role.department_id = department.id
          LEFT JOIN employee manager
          ON employee.manager_id = manager.id`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.table(result);
            promptQuestions();
          }
        );
        // if statement for adding a new department
      } else if (data.intro == "Add a department") {
        inquirer
          .prompt({
            type: "input",
            message: "What is the name of the department?",
            name: "newDep",
          })
          .then(function (depName) {
            const newDep = depName.newDep;
            db.query(
              `INSERT INTO department (name) VALUES ('${newDep}')`,
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                console.log(`Added ${newDep} to the database.`);
                promptQuestions();
              }
            );
          });
        // if statment for adding a new role
      } else if (data.intro == "Add a role") {
        db.query(`SELECT * FROM department`, (err, result) => {
          if (err) {
            console.log(err);
          }
          const departmentChoices = result.map((department) => ({
            name: department.name,
            value: department.id,
          }));
          inquirer
            .prompt([
              {
                type: "input",
                message: "What is the name of the role?",
                name: "newRole",
              },
              {
                type: "input",
                message: "What is the salary of the role?",
                name: "roleSal",
                validate: function (input) {
                  if (isNaN(input)) {
                    return "Please enter a number for salary";
                  }
                  return true;
                },
              },
              {
                type: "list",
                message: "Which department does your role belong to?",
                choices: departmentChoices,
                name: "roleDep",
              },
            ])
            .then(function (role) {
              const title = role.newRole;
              const salary = role.roleSal;
              const departmentId = role.roleDep;
              db.query(
                `INSERT INTO role (title, salary, department_id) VALUES ('${title}', '${salary}', '${departmentId}')`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log(`Added ${title} to the database.`);
                  promptQuestions();
                }
              );
            });
        });
        // if statement for adding a new employee
      } else if (data.intro == "Add an employee") {
        db.query(
          `SELECT 
        role.id AS role_id, 
        role.title AS title 
        FROM role`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const roleChoices = result.map((role) => ({
              name: role.title,
              value: role.role_id,
            }));
            db.query(
              `SELECT 
            employee.id AS manager_id,
            CONCAT(first_name, ' ', last_name) AS manager
        FROM employee`,
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                const managerChoices = result.map((employee) => ({
                  name: employee.manager,
                  value: employee.manager_id,
                }));
                managerChoices.unshift({ name: "None", value: null });
                inquirer
                  .prompt([
                    {
                      type: "input",
                      message: "What is the employee's first name?",
                      name: "firstName",
                    },
                    {
                      type: "input",
                      message: "What is the employee's last name?",
                      name: "lastName",
                    },
                    {
                      type: "list",
                      message: "What is the employee's role?",
                      choices: roleChoices,
                      name: "role",
                    },
                    {
                      type: "list",
                      message: "Who is the employee's manager?",
                      choices: managerChoices,
                      name: "manager",
                    },
                  ])
                  .then(function (employee) {
                    const firstName = employee.firstName;
                    const lastName = employee.lastName;
                    const roleId = employee.role;
                    const managerId = employee.manager;
                    db.query(
                      `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}', '${roleId}', ${managerId})`,
                      (err, result) => {
                        if (err) {
                          console.log(err);
                        }
                        console.log(
                          `Added ${firstName} ${lastName} to the database.`
                        );
                        promptQuestions();
                      }
                    );
                  });
              }
            );
          }
        );
        // if statement for updating an existing employees role
      } else if (data.intro == "Update an employee role") {
        db.query(
          `SELECT 
          employee.id AS id,
          CONCAT(first_name, ' ', last_name) AS employee
      FROM employee`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const employeeChoices = result.map((employee) => ({
              name: employee.employee,
              value: employee.id,
            }));
            db.query(
              `SELECT 
                role.id AS role_id, 
                role.title AS title 
                FROM role`,
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                const employeeRole = result.map((role) => ({
                  name: role.title,
                  value: role.role_id,
                }));
                inquirer
                  .prompt([
                    {
                      type: "list",
                      message: "Which employee's role do you want to update?",
                      choices: employeeChoices,
                      name: "employee",
                    },
                    {
                      type: "list",
                      message:
                        "Which role do you want to assign the selected employee?",
                      choices: employeeRole,
                      name: "role",
                    },
                  ])
                  .then(function (data) {
                    const employee = data.employee;
                    const role = data.role;

                    db.query(
                      `UPDATE employee
                      SET role_id = '${role}'
                      WHERE id = ${employee}`,
                      (err, result) => {
                        if (err) {
                          console.log(err);
                        }
                        console.log(`Updated employees role.`);
                        promptQuestions();
                      }
                    );
                  });
              }
            );
          }
        );
        // if statement for updating an existing employees manager
      } else if (data.intro == "Update an employee's manager") {
        db.query(
          `SELECT 
            employee.id AS id,
            CONCAT(first_name, ' ', last_name) AS employee
        FROM employee`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const employeeChoices = result.map((employee) => ({
              name: employee.employee,
              value: employee.id,
            }));
            db.query(
              `SELECT 
                  employee.id AS manager_id, 
                  CONCAT(first_name, ' ', last_name) AS manager
                  FROM employee`,
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                const managerChoices = result.map((manager) => ({
                  name: manager.manager,
                  value: manager.manager_id,
                }));
                inquirer
                  .prompt([
                    {
                      type: "list",
                      message:
                        "Which employee's manager do you want to update?",
                      choices: employeeChoices,
                      name: "employee",
                    },
                    {
                      type: "list",
                      message:
                        "Which manager do you want to assign the selected employee?",
                      choices: managerChoices,
                      name: "manager",
                    },
                  ])
                  .then(function (data) {
                    const employee = data.employee;
                    const manager = data.manager;

                    db.query(
                      `UPDATE employee
                      SET manager_id = '${manager}'
                      WHERE id = ${employee}`,
                      (err, result) => {
                        if (err) {
                          console.log(err);
                        }
                        console.log(`Updated employees manager.`);
                        promptQuestions();
                      }
                    );
                  });
              }
            );
          }
        );
        // if statement for viewing existing employees by their manager
      } else if (data.intro == "View employees by manager") {
        db.query(
          `SELECT 
          employee.id AS manager_id, 
          CONCAT(first_name, ' ', last_name) AS manager
          FROM employee
          WHERE manager_id IS NULL`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const managerChoices = result.map((manager) => ({
              name: manager.manager,
              value: manager.manager_id,
            }));
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "Which manager's employee list do you want to view?",
                  choices: managerChoices,
                  name: "manager",
                },
              ])
              .then(function (data) {
                const manager = data.manager;
                db.query(
                  `SELECT 
                  CONCAT(manager.first_name, ' ', manager.last_name) AS manager,
                  CONCAT(employee.first_name, ' ', employee.last_name) AS employee's
                FROM employee
                LEFT JOIN employee manager
                ON employee.manager_id = manager.id
                WHERE employee.manager_id = ${manager}`,
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    }
                    console.table(result);
                    promptQuestions();
                  }
                );
              });
          }
        );
        // if statement for viewing existing employees by their department
      } else if (data.intro == "View employees by department") {
        db.query(
          `SELECT 
            id,
            name
            FROM department`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const departmentChoices = result.map((department) => ({
              name: department.name,
              value: department.id,
            }));
            console.log(result);
            inquirer
              .prompt([
                {
                  type: "list",
                  message:
                    "Which department's employee list do you want to view?",
                  choices: departmentChoices,
                  name: "department",
                },
              ])
              .then(function (data) {
                const department = data.department;
                db.query(
                  `SELECT 
                    department.name AS department,
                    CONCAT(employee.first_name, ' ', employee.last_name) AS employee,
                    role.title AS title
                  FROM employee
                    JOIN role
                    ON employee.role_id = role.id 
                    JOIN department 
                    ON role.department_id = department.id
                  WHERE department.id = ${department}`,
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    }
                    console.table(result);
                    promptQuestions();
                  }
                );
              });
          }
        );
        // if statement for deleting a department
      } else if (data.intro == "Delete a department") {
        db.query(
          `SELECT 
            id,
            name
            FROM department`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const departmentChoices = result.map((department) => ({
              name: department.name,
              value: department.id,
            }));
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "Which department would you like to delete?",
                  choices: departmentChoices,
                  name: "department",
                },
              ])
              .then(function (data) {
                const departmentId = data.department;
                db.query(
                  `DELETE FROM department
                  WHERE department.id = ${departmentId}`,
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    }
                    console.log(`The department has been deleted`);
                    promptQuestions();
                  }
                );
              });
          }
        );
        // if statement for deleting a role
      } else if (data.intro == "Delete a role") {
        db.query(
          `SELECT 
            id,
            title
            FROM role`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const roleChoices = result.map((role) => ({
              name: role.title,
              value: role.id,
            }));
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "Which role would you like to delete?",
                  choices: roleChoices,
                  name: "role",
                },
              ])
              .then(function (data) {
                const roleId = data.role;
                console.log(roleId);
                db.query(
                  `DELETE FROM role
                  WHERE role.id = ${roleId}`,
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    }
                    console.log(`The role has been deleted`);
                    promptQuestions();
                  }
                );
              });
          }
        );
        // if statement for deleting an employee
      } else if (data.intro == "Delete an employee") {
        db.query(
          `SELECT 
            id,
            CONCAT(employee.first_name, ' ', employee.last_name) AS name
            FROM employee`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const employeeChoices = result.map((employee) => ({
              name: employee.name,
              value: employee.id,
            }));
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "Which employee would you like to delete?",
                  choices: employeeChoices,
                  name: "employee",
                },
              ])
              .then(function (data) {
                const employeeId = data.employee;
                console.log(employeeId);
                db.query(
                  `DELETE FROM employee
                  WHERE employee.id = ${employeeId}`,
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    }
                    console.log(`The employee has been deleted`);
                    promptQuestions();
                  }
                );
              });
          }
        );
      }
    });
}
promptQuestions();
