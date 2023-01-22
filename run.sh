python3 arc34contract.py  || error_code=$?
error_code_int=$(($error_code + 0))
if [ $error_code_int -ne 0 ]; then
    echo "arc34contract.py build failed";
	exit 1;
fi

yarn test -t "arc34contract.test" || error_code=$?
error_code_int=$(($error_code + 0))
if [ $error_code_int -ne 0 ]; then
    echo "test failed";
	exit 1;
fi
