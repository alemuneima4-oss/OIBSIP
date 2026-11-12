
const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let expression = "";

function tokenize(expression) {
    return expression.match(/(?:\d+\.?\d*|\.\d+)|[+\-*/]/g) || [];
}

function calculateExpression(expression) {
    const tokens = tokenize(expression);

    // First: multiplication and division
    let numbers = [];
    let operators = [];

    numbers.push(parseFloat(tokens[0]));

    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const nextNumber = parseFloat(tokens[i + 1]);

        if (operator === "*") {
            numbers[numbers.length - 1] *= nextNumber;
        } else if (operator === "/") {
            if (nextNumber === 0) {
                throw new Error("Cannot divide by zero");
            }
            numbers[numbers.length - 1] /= nextNumber;
        } else {
            operators.push(operator);
            numbers.push(nextNumber);
        }
    }

    // Second: addition and subtraction
    let result = numbers[0];

    for (let i = 0; i < operators.length; i++) {
        if (operators[i] === "+") {
            result += numbers[i + 1];
        } else {
            result -= numbers[i + 1];
        }
    }

    return result;
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;

        if (value === "C") {
            expression = "";
            display.value = "";
            return;
        }

        if (value === "DEL") {
            expression = expression.slice(0, -1);
            display.value = expression;
            return;
        }

        if (value === "=") {
            try {
                if (!expression) return;

                const result = calculateExpression(expression);

                display.value = Number.isFinite(result)
                    ? result
                    : "Error";

                expression = String(result);
            } catch (error) {
                display.value = error.message;
                expression = "";
            }

            return;
        }

        expression += value;
        display.value = expression;
    });
});
